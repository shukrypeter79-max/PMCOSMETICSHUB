#!/usr/bin/env python3
"""Run one SAM 3.1 concept segmentation request against an HTTPS image URL.

Requires MODEL_API_KEY in the environment. This sends the supplied image URL and
prompt to Meta's model API. Do not use private/customer images without consent.
"""

from __future__ import annotations

import argparse
import os
import sys
from urllib.parse import urlparse

from openai import OpenAI

BASE_URL = "https://api.meta.ai/v1"
MODEL = "sam-3.1"


def validate_prompt(prompt: str) -> str:
    value = " ".join(prompt.split())
    if not value:
        raise ValueError("Prompt cannot be empty.")
    if len(value) > 120:
        raise ValueError("Use a concise noun phrase (at most 120 characters).")
    if any(separator in value for separator in (",", ";", "+", "\n")):
        raise ValueError("Send one concept per request; do not list concepts.")
    lowered = value.lower()
    if " and " in lowered or " or " in lowered:
        raise ValueError("Send one concept per request, not a joined list.")
    return value


def validate_image_url(image_url: str) -> str:
    parsed = urlparse(image_url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("Image URL must be an absolute HTTPS URL accessible to the model API.")
    return image_url


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help='One noun phrase, e.g. "cosmetic bottle"')
    parser.add_argument("--image-url", required=True, help="HTTPS URL for an image you are authorized to process")
    args = parser.parse_args()

    api_key = os.environ.get("MODEL_API_KEY")
    if not api_key:
        print("Set MODEL_API_KEY in your environment; never put it in source code.", file=sys.stderr)
        return 2

    try:
        prompt = validate_prompt(args.prompt)
        image_url = validate_image_url(args.image_url)
        client = OpenAI(base_url=BASE_URL, api_key=api_key)
        with client.responses.stream(
            model=MODEL,
            input=[{
                "type": "message",
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {"type": "input_image", "image_url": image_url},
                ],
            }],
            stream=True,
            metadata={"mask_encoding": "one_bit", "include_confidence": "true"},
        ) as stream:
            for event in stream:
                if event.type == "response.output_text.delta":
                    print(event.delta, end="", flush=True)
                elif event.type == "response.failed":
                    print("\nSAM request failed.", file=sys.stderr)
                    return 1
        print()
        return 0
    except (ValueError, Exception) as exc:
        # Avoid logging request headers or credentials. Provider errors can contain details;
        # print only the exception class to keep accidental sensitive data out of logs.
        print(f"SAM request error: {type(exc).__name__}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
