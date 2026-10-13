# CraftCopy AI

**Product copy for independent makers.**

CraftCopy AI is an open-source, local-first writing assistant for handmade sellers. Enter facts about a product and generate an editable product title, description, social caption, search tags, and image alt text. It is designed for crochet artists, jewellery makers, and small independent shops that want to spend less time on repetitive listing copy.

> CraftCopy generates drafts, not verified product claims. Review every output before publishing.

## Why open-weight AI?

A small seller should not need a paid proprietary API account just to draft product copy. CraftCopy can run an open-weight model on the same machine as the app, which gives the operator more control over where product details are processed, makes model replacement possible, and avoids per-request API charges. The first model download requires an internet connection; once the weights and dependencies are cached, inference can run locally without sending prompts to a third-party model API.

The default model is [Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct). Review its model card and license terms before redistributing weights or using the model commercially. CraftCopy does not bundle model weights. The app also includes a clearly labelled template fallback so the UI and workflow remain usable when model dependencies are not installed or the model cannot be loaded. Template mode is not AI inference and must not be described as such.

## Features

- Generate a product title, description, social caption, tags, and image alt text.
- Tailor drafts for Instagram, Etsy-style listings, or a general product page.
- Choose a writing tone: warm and clear, minimal, playful, or premium.
- Edit generated text directly in the browser and copy individual fields or the full draft.
- Run local inference through Hugging Face Transformers.
- Use a template fallback when the model is unavailable.
- FastAPI endpoints and interactive API documentation.
- Responsive interface, input validation, and basic automated tests.

## Quick start: app without model inference

Python 3.10 or newer is recommended.

```bash
python -m venv .venv
```

Activate the environment:

- Linux/macOS: `source .venv/bin/activate`
- Windows PowerShell: `.venv\\Scripts\\Activate.ps1`

Install and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000`. This basic install uses template mode unless model dependencies are also installed.

## Enable local open-weight inference

Install the model dependencies:

```bash
pip install -r requirements-model.txt
```

Then run:

```bash
uvicorn app.main:app --reload
```

The first generation downloads the model if it is not already cached. The default model is small compared with many chat models, but actual speed and memory use depend on hardware. CPU inference can be slow. To use another compatible Transformers chat model, set `CRAFTCOPY_MODEL_ID` before starting the server. Make sure the chosen model's license and hardware requirements fit your use case.

Example on Linux/macOS:

```bash
export CRAFTCOPY_MODEL_ID=Qwen/Qwen2.5-0.5B-Instruct
uvicorn app.main:app --reload
```

PowerShell:

```powershell
$env:CRAFTCOPY_MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"
uvicorn app.main:app --reload
```

## API

- `GET /api/health` — basic health check.
- `GET /api/model-status` — reports whether model weights are loaded and the current mode.
- `POST /api/generate` — generate listing copy from product details.
- `GET /docs` — interactive FastAPI documentation.

Example request:

```bash
curl -X POST http://127.0.0.1:8000/api/generate \\
  -H 'Content-Type: application/json' \\
  -d @examples/sample_product.json
```

## Tests

```bash
pip install pytest httpx
pytest -q
```

The generation API test can trigger a model download if model dependencies are installed and weights are not cached. For a quick test run, use an environment without `torch` and `transformers` installed so it exercises template mode.

## Project structure

```text
craftcopy-ai/
├── app/
│   ├── main.py                 # FastAPI app and endpoints
│   ├── generator.py            # Local model and fallback generation
│   └── static/
│       ├── index.html          # Main interface
│       ├── styles.css          # Responsive visual design
│       └── app.js              # Form, results, and copy interactions
├── examples/
│   └── sample_product.json
├── tests/
│   └── test_api.py
├── .env.example
├── requirements.txt
├── requirements-model.txt
└── README.md
```

## Responsible output

- Do not add product claims that the seller did not provide.
- Check dimensions, materials, price, availability, and shipping details yourself.
- Search tags are suggestions, not a guarantee of platform ranking or sales.
- Avoid entering personal customer information into product fields.
- Do not publish generated copy without human review.

## Roadmap

- Add listing presets for specific handmade categories.
- Add export to Markdown and CSV for batch workflows.
- Evaluate factual accuracy and editing time with real sellers before making performance claims.
- Add optional saved drafts with explicit local storage controls.

## Contributing

Issues and pull requests are welcome. Please include reproduction steps for bugs and tests for behavior changes. Do not submit real customer data or model weights.

## License

This project is released under the MIT License. The model and its weights are distributed separately and remain subject to their own license terms.
