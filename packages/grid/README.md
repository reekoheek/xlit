# @xlit/grid

Lit draggable grid element

## Installation

```sh
npm i @xlit/grid
```

## Getting started

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Grid</title>
</head>
<body>
  <xlit-grid>
    <div class="card" x="0" y="0" w="1" h="1">
      <span class="text">1</span>
    </div>
    <div class="card" x="1" y="0" w="1" h="2">
      <span class="text">1</span>
    </div>
    <div class="card" x="0" y="1" w="2" h="1">
      <span class="text">1</span>
    </div>
  </xlit-grid>

  <script type="module" defer>
    import '@xlit/grid';
  </script>
</body>
</html>
```
