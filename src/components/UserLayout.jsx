import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

function UserLayout({ user, children }) {
    return (
        <div className="d-flex flex-column min-vh-100">
            <UserHeader user={user} />
            <main className="flex-grow-1">
                {children}
            </main>
            <UserFooter />
        </div>
    );
}

export default UserLayout;
