function UnauthorizedAccess() {
    return (
        <div className="container p-5 text-center">
            <h2 className="text-primary fw-bold mb-3">Unauthorized Access</h2>
            <p className="text-muted mb-4">
                You do not have permission to view this page.
                Contact your admin for further assistance.
            </p>
            <a href="/dashboard" className="btn btn-primary rounded-pill px-4">Go to Groups</a>
        </div>
    );
}

export default UnauthorizedAccess;
