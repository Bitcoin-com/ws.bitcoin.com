## ws.bitcoin.com

```js
let socket = new bitbox.Socket({
  callback: () => {
    console.log("connected")
  },
  restURL: "http://localhost:3000"
})
socket.listen("transactions", message => {
  console.log(message)
})
```
