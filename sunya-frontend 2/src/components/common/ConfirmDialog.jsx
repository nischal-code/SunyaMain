import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog
 * Small confirmation modal for destructive or important actions
 * (delete a user, revoke a session, cancel a task, etc). Built on top
 * of Modal + Button.
 *
 * Props:
 *  - isOpen:      bool — required
 *  - title:       string — default "Are you sure?"
 *  - message:     string | node — supporting description
 *  - confirmText: string — default "Confirm"
 *  - cancelText:  string — default "Cancel"
 *  - variant:     "danger" | "primary" — styles the confirm button, default "danger"
 *  - isLoading:   bool — shows a spinner on the confirm button and disables both buttons
 *  - onConfirm:   fn — required
 *  - onCancel:    fn — required, also used to close on backdrop/Escape
 */
const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnBackdrop={!isLoading}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      {typeof message === "string" ? <p>{message}</p> : message}
    </Modal>
  );
};

export default ConfirmDialog;
