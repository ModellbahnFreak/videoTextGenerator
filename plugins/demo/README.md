# Vidotextgenerator Demo Plugin
## Structure of Plugin
```
|
+ frontend
| |
| + index.ts (Root file of frontend plugin)
| + graphic (Components that generate graphics)
| | |
| | + *.vue
| + editor (Components to be displayed in editor)
|   |
|   + *.vue
+ backend
| |
| + ...
+ package.json
+ (tsconfig.json)
```

### Frontend Plugin
- `index.ts` or `index.js`
    - One of them MUST existin the folder frontend
    - It will be automatically compiled when building the frontend (incl. all files it imports)
    - It MUST provide an _instance_ of `FrontendPlugin` as default export
    - Components to be displayed are loaded through the functions of the exported instance
    - The `run` function will be executed once on start andprovide the instance of the API to be used
        - Reccomended: caching of the api and providing it to all components that require it
    - WARNING: Bahaviour is undefined, if both a js and a ts file exist! The first one found will be used
- Graphic componnts:
    - All Vue components returned by the `getGraphicComponents` function are used on the rendered graphic page
    - The location (in this plugin the `graphic` folder does not matter)
    - Each one will be encapsulated in a div spanning the whole viewport
- Editor folder:
    - All Vue components returned by the `getEditorComponents` function will be a card on the editor page
    - The location (in this plugin the `editor` folder does not matter)

### Backend Plugin
- The compile process will try to use `references` in tsconfig to include the plugin
    - This is not required. Plugin can manage compilation itself
- The file referenced in `package.json` under `exports["./backend"]` will be included
    - It MUST provide an _instance_ of `BackendPlugin` as default export
- Alternative: Have a `index.js` in the folder `frontend` or `out/frontend`