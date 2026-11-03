import json
from typing import Any

from workers import WorkerEntrypoint, Request, Response

COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Finland", "Poland",
    "United Arab Emirates", "Saudi Arabia", "Egypt", "South Africa", "Kenya",
    "India", "Japan", "Singapore", "Brazil", "Mexico"
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
    "Soft Depth Serum", "Bloom Restorer", "Violet Calm", "Aqua Silk", "Frosted Nectar", "Moss Dew"
]


def _country_for_index(index: int) -> str:
    return COUNTRIES[index % len(COUNTRIES)]


def _build_catalog() -> list[dict[str, Any]]:
    apps: list[dict[str, Any]] = []
    for i in range(1, 601):
        app_name = LEGACY_APP_NAMES[(i - 1) % len(LEGACY_APP_NAMES)]
        category = ["Beauty", "Skincare", "Wellness", "Care", "Lifestyle", "Essentials"][i % 6]
        region = _country_for_index(i)
        apps.append({
            "id": i,
            "name": f"{app_name} {i}",
            "category": category,
            "country": region,
            "price": round(5.99 + (i % 17) * 2.35, 2),
            "rating": round(3.8 + (i % 15) * 0.1, 1),
            "status": "active" if i % 3 else "beta",
            "currency": "USD",
            "featured": i % 5 == 0,
            "tags": [category.lower(), region.lower().replace(" ", "-")],
            "description": f"{app_name} for {region} market. Helps users discover premium beauty and wellness routines.",
        })
    return apps

CATALOG = _build_catalog()


def _json_response(data: Any, status: int = 200) -> Response:
    return Response(
        json.dumps(data),
        status=status,
        headers={"content-type": "application/json; charset=utf-8"},
    )


class Default(WorkerEntrypoint):
    async def fetch(self, request: Request):
        url = request.url
        path = url.split("?", 1)[0].rstrip("/")

        if path == "" or path == "/":
            return _json_response({
                "service": "PMCosmeticsHub App Store API",
                "status": "online",
                "countries": len(COUNTRIES),
                "apps": len(CATALOG),
                "version": "0.1.0",
                "endpoints": [
                    "/health",
                    "/countries",
                    "/apps",
                    "/apps?country=United States",
                    "/apps?limit=25&page=2",
                ],
            })

        if path == "/health":
            return _json_response({"status": "ok", "items": len(CATALOG), "countries": len(COUNTRIES)})

        if path == "/countries":
            return _json_response({"countries": COUNTRIES})

        if path == "/apps":
            params = request.url.split("?", 1)[1] if "?" in request.url else ""
            query = {}
            if params:
                for pair in params.split("&"):
                    if "=" in pair:
                        key, value = pair.split("=", 1)
                        query[key.lower()] = value

            country = query.get("country")
            if country:
                country = country.replace("+", " ")
                filtered = [app for app in CATALOG if app["country"].lower() == country.lower()]
            else:
                filtered = list(CATALOG)

            page = int(query.get("page", "1"))
            limit = int(query.get("limit", "50"))
            start = (page - 1) * limit
            end = start + limit
            page_items = filtered[start:end]

            return _json_response({
                "page": page,
                "limit": limit,
                "total": len(filtered),
                "countries": len(COUNTRIES),
                "items": page_items,
            })

        if path.startswith("/apps/"):
            try:
                app_id = int(path.split("/")[-1])
            except ValueError:
                return _json_response({"error": "Invalid app id"}, 400)

            app = next((item for item in CATALOG if item["id"] == app_id), None)
            if app is None:
                return _json_response({"error": "App not found"}, 404)
            return _json_response(app)

        return _json_response({"error": "Not found"}, 404)
