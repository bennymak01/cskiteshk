## Product Images Convention
Images are stored in `/images/` (or `/assets/images/`).
### Naming Format
`{item-code}-{description}-{n}.jpg`
### Examples
- `kite-020-four-winged-goldfish-red-1.jpg`
- `kite-020-four-winged-goldfish-red-2.jpg`
- `kite-094-magic-octopus-8m-1.jpg`
### Rules
- Item code matches `Item Code` column in product Excel/data file
- `-1`, `-2` suffix for multiple photos per product
- First image (`-1`) is always the main/cover photo
- All lowercase, hyphens only, no spaces
### How to load images for a product
Filter all images where filename starts with `item.code`:
`kite-020-*` → returns all photos for that product
