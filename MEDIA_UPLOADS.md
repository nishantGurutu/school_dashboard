# Shared dashboard images and documents

`src/services/mediaService.js` exposes `saveImage(file, { kind: 'photo' | 'document' })`, `compressImage`, and `mediaUrl`. `src/components/ui/MediaUpload.jsx` provides optional selection, drag/drop, preview, upload retry, and a save-in-progress guard. Student, father, mother, guardian, staff, document, and certificate photo inputs use this common implementation.

Files are uploaded as multipart data to authenticated `POST /api/files/media?kind=photo` (or `document`). The backend validates the actual image/document, compresses images, and stores the binary bytes in the database's `stored_media` table. Profile records store short file URLs. Student/guardian/staff GET responses include those references; lists do not embed binary/base64 data. `GET /api/files/media/{id}` serves the saved bytes with a cache header. `mediaUrl` resolves backend-relative file references correctly when the dashboard is on Vercel.

- Uploads are optional; no file is required to create a profile.
- Maximum input file size: 8 MB. Images above 24 megapixels are rejected before server decoding.
- Photos: maximum 1600 pixels on the longer edge; JPEG quality 86% on the server.
- Document images: maximum 2200 pixels; JPEG quality 90% to retain readable text.
- Images are never enlarged. Browser orientation normalization and high-quality resizing are applied before upload; the backend applies final size/quality rules even for other API clients.
- PDF/DOC/DOCX documents retain their original bytes. Word documents are served as downloads. SVG/HTML and malformed images are rejected. DOCX expanded content is bounded and macro projects are rejected.
- A failed or unfinished upload blocks form submission until it finishes, is retried, or the optional selection is removed. Existing saved files appear when editing a profile; changing unrelated fields retains their URLs.
- Student guardian/father/mother image references are returned in the student response. The selected guardian's photo also syncs into the guardian directory when a guardian account is created from the student form.

Deploy the backend before the dashboard. The existing Hibernate `ddl-auto=update` configuration creates `stored_media` and adds optional `doc_file` columns on guardians/teachers. Existing local-disk files are not moved by this change.

Compression reduces storage/transfer size but cannot guarantee identical visual quality for every original. The fixed quality floor and dimension bounds avoid chasing an arbitrarily tiny file size at the cost of legibility. Files selected and uploaded before a profile is submitted already exist in `stored_media`; references are linked when the profile is saved.

Tests: `MediaStorageFlowTest` checks actual database bytes, image dimensions, download responses, invalid uploads, and student/guardian/staff reference round trips. `tests/media-service.test.mjs` covers optional uploads, safe URLs, file limits, lossless PDFs, caching and retry behavior.
