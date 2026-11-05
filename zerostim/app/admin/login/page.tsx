import { adminLogin } from "../../actions";
import { LoginForm } from "../../login/form";

export default function AdminLogin() {
  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">App manager</h1>
        <p className="muted" style={{ marginTop: 8 }}>For the person who runs ZeroStim. Parents log in at the normal login page.</p>
      </div>
      <LoginForm action={adminLogin} withEmail={false} />
    </>
  );
}
