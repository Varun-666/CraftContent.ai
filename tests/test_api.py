from fastapi.testclient import TestClient

from app.main import app
from app.generator import _fallback

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_homepage_loads() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "CraftCopy AI" in response.text


def test_generate_returns_listing() -> None:
    response = client.post("/api/generate", json={
        "product_name": "Crochet daisy tote bag",
        "category": "Bags and accessories",
        "materials": "Cotton yarn",
        "dimensions": "25 x 20 cm",
        "features": "Handmade floral design",
        "platform": "Instagram",
        "tone": "Warm and clear",
    })
    assert response.status_code == 200
    body = response.json()
    assert body["title"]
    assert body["description"]
    assert body["social_caption"]
    assert isinstance(body["tags"], list)
    assert body["alt_text"]


def test_missing_product_name_is_rejected() -> None:
    response = client.post("/api/generate", json={"product_name": "x"})
    assert response.status_code == 422


def test_fallback_does_not_invent_materials() -> None:
    result = _fallback({"product_name": "Handmade pouch"})
    assert "silk" not in result["description"].lower()
    assert "cotton" not in result["description"].lower()
    assert result["model"] == "template-fallback"
