- In MessageForm, having a controlled component (passing value back down to the input) allows us to clear the input by just setting the state of the message property to ''
- In handleChange in MessageForm, we don't want to use .trim() (it will prevent any spaces from being written)
- Upon deployment, change emoji-mart plugin from Picker to NimblePicker
- Maybe make each message content-editable?!
