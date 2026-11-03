"""Synthetic, deterministic catalog data and query helpers for the demo Worker."""

from __future__ import annotations

from typing import Any

COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Finland", "Poland",
    "United Arab Emirates", "Saudi Arabia", "Egypt", "South Africa", "Kenya",
    "India", "Japan", "Singapore", "Brazil", "Mexico",
]

LEGACY_APP_NAMES = [
    "Glow Boost Serum", "Luna Lotion", "Rose Dew Cleanser", "Velvet Mask", "Silk Mist",
    "Nova Repair Cream", "Amber Glow Essence", "Pure Pore Tonic", "Sunveil SPF", "Bloom Ritual Oil",
    "Hydra Calm Gel", "Petal Peel", "Cobalt Cleanser", "Pearl Barrier Cream", "Satin Reset Serum",
    "Mosaic Mist", "Moon Silk Toner", "Velour Repair Mask", "Crystal Dew Essence", "Forest Renew Soap",
    "Dawn Vitamin Serum", "Radiant Lift Cream", "Golden Glow Balm", "Airy Mist", "Prism Cleanse",
    "Refine Night Oil", "Crescent Peel", "Soft Reset Lotion", "Glowstone Mist", "Vitamin Bloom",
    "Boundless Buffer", "Cielo Wash", "Opal Essence", "Horizon Cleanser", "Night Bloom Cream",
    "Velvet Veil", "Regent Repair", "Sunlit Serum", "Lunar Formula", "Frosthydrate", "Petal Nectar",
    "Mira Mist", "Noir Cleanse", "Prisma Serum", "Skyline Toner", "Berry Cloud Cream", "Sculpt Lift",
    "Pure Lab Essence", "Solstice Peel", "Everlight Foam", "Luxe Balance Serum", "Aster Mist",
    "Aurum Repair Oil", "Aqua Bloom Cleanser", "Lean Veil", "Mellow Dew", "Moonbeam Serum",
    "Rescue Balance", "Moisture Veil", "Canvas Lather", "Pristine Foam", "Quiet Dew", "Organic Bloom",
    "Supreme Hydration", "Satin Renewal", "Hydro Lift", "Urban Glow", "Golden Mist", "Citrine Care",
    "Soft Depth Serum", "Bloom Restorer", "Violet Calm", "Aqua Silk", "Frosted Nectar", "Moss Dew",
]


def build_catalog() -> list[dict[str, Any]]:
    """Return 600 fictional fixtures. Values are not verified product facts."""
    items: list[dict[str, Any]] = []
    categories = ["Beauty", "Skincare", "Wellness", "Care", "Lifestyle", "Essentials"]
    for index in range(1, 601):
        name = LEGACY_APP_NAMES[(index - 1) % len(LEGACY_APP_NAMES)]
        category = categories[index % len(categories)]
        country = COUNTRIES[index % len(COUNTRIES)]
        items.append({
            "id": index,
            "name": f"{name} {index}",
            "category": category,
            "country": country,
            "price": round(5.99 + (index % 17) * 2.35, 2),
            "rating": round(3.8 + (index % 15) * 0.1, 1),
            "status": "active" if index % 3 else "beta",
            "currency": "USD",
            "featured": index % 5 == 0,
            "tags": [category.lower(), country.lower().replace(" ", "-")],
            "description": f"Fictional demo entry for {country}; not a real listing or availability claim.",
            "is_demo": True,
        })
    return items


def filter_catalog(
    catalog: list[dict[str, Any]], *, country: str | None = None, search: str = "",
    min_price: float | None = None, max_price: float | None = None,
    sort: str = "id", descending: bool = False,
) -> list[dict[str, Any]]:
    """Apply validated, deterministic filters and a stable sort."""
    result = catalog
    if country:
        result = [item for item in result if item["country"].casefold() == country.casefold()]
    if search:
        needle = search.casefold()
        result = [item for item in result if needle in " ".join([
            item["name"], item["category"], item["country"], item["description"], *item["tags"],
        ]).casefold()]
    if min_price is not None:
        result = [item for item in result if item["price"] >= min_price]
    if max_price is not None:
        result = [item for item in result if item["price"] <= max_price]
    return sorted(result, key=lambda item: (item[sort], item["id"]), reverse=descending)


CATALOG = build_catalog()
