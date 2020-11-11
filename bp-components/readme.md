![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# BP's Web Components Library

This is a Web Component Library created using Stencil.

<!-- Stencil is also great for building entire apps. For that, use the [stencil-app-starter](https://github.com/ionic-team/stencil-app-starter) instead. -->

# \<bp-persistent-storage />

This component handles setting/getting key-value pairs to/from IndexedDB storage, together with timestamp information about the moment when they were saved.

## Props
### `dbname`
The name of our IndexedDB database

Has the default value of `bp-persistent-storage-default`

Can be modified by passing the desired database name to the web component as attribute 
```html
<bp-persistent-storage dbname="my-custom-db-name" />
```

### `dbversion`
The version of the database

Has the default value of `1`

Can be modified by passing the desired database version to the web component as attribute 
```html
<bp-persistent-storage dbversion="99" />
```

### `dbstorename`
The name of the database store

Has the default value of `key-value-default`

Can be modified by passing the desired store name to the web component as attribute 
```html
<bp-persistent-storage dbstorename="my-custom-store-name" />
```

## Methods
### `setKey(key: string, value: object)`
Writes the `key` - `value` pair in the database.
If the `key` already exists in the database, the new `value` will overwrite the existing `value`.

Returns a `Promise`
```ts
setKey(key: string, value: Object)
  .then(resolveObject => ...)
  .catch(rejectObject => ...)
```
* that resolves with an Object
  ```ts
  resolveObject: {
    key: string,
    value: Object,
    time: {
      received: number,
      saved: number
    }
  })
  ```
  where time holds the timestamps:
  - when the `setKey` request was received
  - when the `key` - `value` pair was saved in the database
* or rejects with an Object
  ```ts
  rejectObject: {
    key: string,
    value: Object,
    error: Object
  })
  ```
  The rejection reason can be displayed using
  ```ts
  console.error(rejectObject.error)
  ```

### `getKey(key: string)`
#
Returns a `Promise`
```ts
getKey(key: string)
  .then(resolveObject => ...)
  .catch(rejectObject => ...)
```
* that resolves with an Object
  ```ts
  resolveObject: {
    key: string,
    value: Object,
    time: {
      received: number,
      saved: number
    }
  })
  ```
  where time holds the timestamps:
  - when the `setKey` request was received
  - when the `key` - `value` pair was saved in the database
  
  If the `key` is _not_ found in the database, the `Promise` will still be resolved, but the Object will look like
  ```ts
  resolveObject: {
    key: string,
    value: undefined,
    time: undefined
  })
  ```
* or rejects with an Object
  ```ts
  rejectObject: {
    key: string,
    error: Object
  })
  ```
  The rejection reason can be displayed using
  ```ts
  console.error(rejectObject.error)
  ```
