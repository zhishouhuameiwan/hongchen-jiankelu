# Doubao source exports

Place images exported from the local Doubao app here using the same relative path printed by:

```bash
npm run art:list
```

Example:

```text
art-source/doubao/cards/basic_slash.png
art-source/doubao/figures/heroines/shen_qingshuang.png
```

Accepted source formats: `.png`, `.webp`, `.jpg`, `.jpeg`.

Then run:

```bash
npm run art:import-doubao
npm run art:validate
```

The importer keeps the existing public manifest paths stable by embedding the raster image into the current SVG wrapper path under `public/assets/**`.
