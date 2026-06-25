import { Alert } from "react-bootstrap"

const Message = ({ variant = "info", children }) => {
  return (
    <Alert variant={variant} className="fade-in">
      {children}
    </Alert>
  )
}

export default Message
