import unittest

from catalog_data import CATALOG, CATEGORIES, COUNTRIES, filter_catalog


class CatalogDataTests(unittest.TestCase):
    def test_fixture_catalog_is_explicitly_synthetic_and_stable(self):
        self.assertEqual(len(CATALOG), 600)
        self.assertTrue(all(item["is_demo"] is True for item in CATALOG))
        self.assertEqual(len(COUNTRIES), 23)
        self.assertEqual(len(CATEGORIES), 6)
        self.assertEqual(len({item["id"] for item in CATALOG}), 600)

    def test_country_and_category_filter_are_case_insensitive(self):
        results = filter_catalog(CATALOG, country="egypt", category="skincare")
        self.assertTrue(results)
        self.assertTrue(all(item["country"] == "Egypt" and item["category"] == "Skincare" for item in results))

    def test_search_is_case_insensitive_and_searches_metadata(self):
        results = filter_catalog(CATALOG, search="wellness")
        self.assertTrue(results)
        self.assertTrue(all("wellness" in item["category"].lower() or "wellness" in item["description"].lower() for item in results))

    def test_price_range_and_sort(self):
        results = filter_catalog(CATALOG, min_price=10, max_price=15, sort="price")
        self.assertTrue(results)
        self.assertTrue(all(10 <= item["price"] <= 15 for item in results))
        self.assertEqual([item["price"] for item in results], sorted(item["price"] for item in results))

    def test_empty_filter_is_empty(self):
        self.assertEqual(filter_catalog(CATALOG, search="no-such-fixture"), [])


if __name__ == "__main__":
    unittest.main()
