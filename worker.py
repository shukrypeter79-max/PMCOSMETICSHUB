import json
from urllib.parse import parse_qs, urlsplit

from workers import WorkerEntrypoint, Request, Response

from catalog_data import CATALOG, COUNTRIES, filter_catalog

MAX_LIMIT = 100
SORT_FIELDS = {"id", "name", "price", "rating"}
CORS_HEADERS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, HEAD, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
}


def _json_response(data, status=200, extra_headers=None):
    headers = {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60, stale-while-revalidate=300",
        **CORS_HEADERS,
    }
    if extra_headers:
        headers.update(extra_headers)
    return Response(json.dumps(data), status=status, headers=headers)


def _error(message, status=400):
    return _json_response({"error": message, "is_demo": True}, status)


def _single_query(params, name, default=None):
    values = params.get(name, [])
    if len(values) > 1:
        raise ValueError(f"Parameter '{name}' must appear only once")
    return values[0] if values else default


def _number_param(params, name):
    raw = _single_query(params, name)
    if raw is None:
        return None
    try:
        value = float(raw)
    except (TypeError, ValueError):
        raise ValueError(f"Parameter '{name}' must be a number") from None
    if value < 0 or value != value or value == float("inf"):
        raise ValueError(f"Parameter '{name}' must be a finite non-negative number")
    return value


class Default(WorkerEntrypoint):
    async def fetch(self, request: Request):
        method = request.method.upper()
        if method == "OPTIONS":
            return Response("", status=204, headers=CORS_HEADERS)
        if method not in ("GET", "HEAD"):
            return _json_response({"error": "Method not allowed"}, 405, {"allow": "GET, HEAD, OPTIONS"})

        parsed_url = urlsplit(request.url)
        path = parsed_url.path.rstrip("/") or "/"
        if path == "/":
            return _json_response({
                "service": "PMCosmeticsHub synthetic demo catalog API",
                "status": "online",
                "is_demo": True,
                "notice": "All catalog records and prices are fictional fixtures, not real products or inventory.",
                "countries": len(COUNTRIES),
                "items": len(CATALOG),
                "endpoints": ["/health", "/countries", "/apps", "/apps/{id}"],
                "query_parameters": {"country": "exact country name", "q": "search text", "min_price": "number", "max_price": "number", "sort": "id|name|price|rating", "order": "asc|desc", "page": "1-based", "limit": f"1-{MAX_LIMIT}"},
            })
        if path == "/health":
            return _json_response({"status": "ok", "is_demo": True, "items": len(CATALOG), "countries": len(COUNTRIES)})
        if path == "/countries":
            return _json_response({"is_demo": True, "countries": COUNTRIES})

        if path == "/apps":
            try:
                params = parse_qs(parsed_url.query, keep_blank_values=True, strict_parsing=False)
                allowed = {"country", "q", "min_price", "max_price", "sort", "order", "page", "limit"}
                unknown = set(params) - allowed
                if unknown:
                    raise ValueError(f"Unknown query parameter: {sorted(unknown)[0]}")
                country = _single_query(params, "country")
                if country and country.casefold() not in {item.casefold() for item in COUNTRIES}:
                    raise ValueError("Unsupported country; use a value from /countries")
                search = _single_query(params, "q", "")
                if len(search) > 100:
                    raise ValueError("Search query is too long (maximum 100 characters)")
                minimum = _number_param(params, "min_price")
                maximum = _number_param(params, "max_price")
                if minimum is not None and maximum is not None and minimum > maximum:
                    raise ValueError("min_price cannot exceed max_price")
                sort = _single_query(params, "sort", "id")
                if sort not in SORT_FIELDS:
                    raise ValueError("sort must be one of: id, name, price, rating")
                order = _single_query(params, "order", "asc").lower()
                if order not in ("asc", "desc"):
                    raise ValueError("order must be asc or desc")
                page = int(_single_query(params, "page", "1"))
                limit = int(_single_query(params, "limit", "50"))
                if page < 1:
                    raise ValueError("page must be at least 1")
                if limit < 1 or limit > MAX_LIMIT:
                    raise ValueError(f"limit must be between 1 and {MAX_LIMIT}")
                filtered = filter_catalog(
                    CATALOG, country=country, search=search, min_price=minimum,
                    max_price=maximum, sort=sort, descending=order == "desc",
                )
                start = (page - 1) * limit
                return _json_response({
                    "is_demo": True,
                    "notice": "Synthetic fixtures only. Do not use as product, pricing, or stock data.",
                    "page": page,
                    "limit": limit,
                    "total": len(filtered),
                    "countries": len(COUNTRIES),
                    "items": filtered[start:start + limit],
                })
            except (ValueError, OverflowError) as exc:
                return _error(str(exc))

        if path.startswith("/apps/"):
            raw_id = path.rsplit("/", 1)[-1]
            if not raw_id.isdecimal():
                return _error("Invalid app id", 400)
            item_id = int(raw_id)
            item = next((entry for entry in CATALOG if entry["id"] == item_id), None)
            if item is None:
                return _error("App not found", 404)
            return _json_response(item)

        return _error("Not found", 404)
