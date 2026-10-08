# OneTouchAuto

A MERN dealership storefront prototype built for Shottenkirk CDJR (Chrysler, Dodge, Jeep, Ram): live new-vehicle inventory, test drive requests, finance tools and a GPT-4 "finance concierge" that walks a buyer through document collection.

**Live:** https://onetouchauto.onrender.com (the production origin in the server's CORS allowlist)

## The problem

Buying a car online usually stops at "contact the dealer". The goal here was to show Shottenkirk how much of the front half of a deal could happen on the website: find a vehicle in the dealer's real stock, book a test drive, estimate a payment and trade-in, pre-qualify, assemble a deal, and hand the finance office a buyer whose documents are already in. The project started as `shottenkirk-app` and was renamed OneTouchAuto when it moved to its own domain.

## What I built

I built the whole thing solo: the React client, the Express API, the inventory import, the email notifications and the AI concierge.

## Key features

- **Inventory from the dealer's own export.** `server/utils/seedInventory.js` parses a vAuto inventory CSV (stock number, VIN, class, MSRP, advertised price, incentives) into MongoDB. The client fetches it for a home page model slider and a `/new-vehicles` grid with class filter, price-range filter and search by model or stock number.
- **Vehicle detail pages** at `/vehicle/:id`, with images resolved from a model-name lookup table and a placeholder fallback when an image fails to load.
- **Test drive requests.** The modal posts to `/api/test-drive`; the server saves a `TestDrive` document and emails the sales inbox.
- **AI finance concierge ("MeeRa").** A chat panel on the finance and vehicle pages. Each browser gets a UUID session stored in MongoDB with the vehicle and purchase type (buy, lease or finance). Every message is sent to OpenAI GPT-4 together with that session's vehicle and its list of missing documents, so replies are grounded in where the buyer actually is. The server also maps intent to UI actions: a pre-qualification question returns `show_prequal_form`, "start my credit application" returns a navigate action, and "send to finance" with nothing missing generates a PDF summary (PDFKit) and emails finance.
- **Document collection.** Buyers upload a driver's license, insurance card and trade-in title; a status panel shows what is still missing, and when all three are in the server emails the finance team automatically.
- **Finance page tools:** a loan payment calculator (standard amortisation formula, 0% APR handled), a trade-in estimator, a credit pre-qualification form, special offers, FAQ and a full credit application form.
- **Buy Now flow.** A 7-step modal (overview, trade-in, financing, build deal, customer info, delivery, confirmation) that totals the deal and monthly payment, with state kept in `sessionStorage` so the buyer can leave to pre-qualify and come back.

### Prototype boundaries

The pre-qualification, trade-in value, credit application and Buy Now steps run in the browser as a sales demo. Approvals and APRs come from simple rules on the stated credit range and income (or fixed demo values), no credit bureau is called, and those forms are not yet submitted to the server. Pre-owned, Specials, Service and About routes are placeholders.

## Architecture

```
 React 19 + Vite client  (/api proxied to :5050 in dev)
        |
        v
 Express (ESM)  /api/inventory   /api/test-drive
        |       /api/concierge   /api/agent/message   /api/uploads
        |
        +--> MongoDB: Vehicle, TestDrive, ConciergeSession
        +--> OpenAI chat completions (GPT-4)
        +--> PDFKit (credit application summary)
        +--> Nodemailer over Gmail SMTP (sales and finance inboxes)
        +--> local disk: uploaded documents, served at /uploads
```

In production the same Express process serves the built client from `client/dist`. CORS is limited to the local dev ports, the Render origin and an optional `CLIENT_URL`.

## Integrations

- **OpenAI** (`openai` SDK): concierge replies.
- **Nodemailer / Gmail SMTP:** test drive alerts and concierge completion emails.
- **PDFKit:** credit application PDF for the finance hand-off.
- **Multer:** multi-file document upload (up to 5 files per request).
- **vAuto CSV export:** inventory source.

## Tech stack

- **Client:** React 19, Vite 4, React Router 7, MUI 7 (theme), plain CSS per component
- **Server:** Node 18+, Express 4, Mongoose 8, OpenAI SDK, Nodemailer, PDFKit, Multer
- **Data:** MongoDB
- **Hosting:** Render (single web service)

## Running locally

```bash
npm install                 # installs client and server dependencies
cd server && node index.js  # API on :5050
cd client && npm run dev    # Vite on :5173, proxies /api to :5050
```

Load inventory from the CSV. The script reads `./server/data/inventory.csv` relative to the working directory, so run it from the repo root. It needs `csv-parser`, which is declared in the client package, so make it resolvable from the server first:

```bash
npm install --no-save --prefix server csv-parser
node server/utils/seedInventory.js
```

Production build: `npm run build` then `npm start`.

Create `server/.env` (see `server/.env.example`) with these variables (names only):

```
MONGO_URI
OPENAI_API_KEY
EMAIL_USER
EMAIL_PASS
EMAIL_TO
CLIENT_URL
PORT
NODE_ENV
```

## Screenshots

<!-- screenshots: add docs/screenshot-*.png -->
