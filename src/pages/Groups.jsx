import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useEffect, useState } from "react";
import GroupCard from "../components/GroupCard";
import CreateGroupModal from "../components/CreateGroupModal";
import Can from "../components/Can";
import { usePermission } from "../rbac/userPermissions";

function Groups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const permissions = usePermission();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(3);
    const [sortBy, setSortBy] = useState('newest');

    const fetchGroups = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${serverEndpoint}/group/my-groups?page=${page}&limit=${limit}&sortBy=${sortBy}`,
                { withCredentials: true }
            );

            if (response.data && response.data.pagination) {
                setGroups(response.data.groups);
                setTotalPages(response.data.pagination.totalPages);
                setCurrentPage(response.data.pagination.currentPage);
            } else {
                console.error("Malformed API response:", response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupUpdateSuccess = (data) => {
        fetchGroups(currentPage);
    };

    useEffect(() => {
        fetchGroups(currentPage);
    }, [currentPage, sortBy]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading && groups.length === 0) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-primary"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">
                    Syncing your circles...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-5 px-4 px-md-5">
            <div className="row align-items-center mb-5">
                <div className="col-md-5 text-center text-md-start mb-3 mb-md-0">
                    <h2 className="fw-bold text-dark display-6">
                        Manage <span className="text-primary">Groups</span>
                    </h2>
                    <p className="text-muted mb-0">
                        View balances, invite friends, and settle shared
                        expenses in one click.
                    </p>
                </div>

                <div className="col-md-7">
                    <div className="d-flex align-items-center justify-content-md-end gap-3 flex-wrap">
                        <div className="d-flex align-items-center bg-white px-3 py-2 rounded-pill shadow-sm border border-light-subtle">
                            <label className="me-2 small fw-bold text-secondary mb-0">Sort:</label>
                            <select
                                className="form-select form-select-sm border-0 bg-transparent fw-bold text-primary"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{ width: 'auto', outline: 'none', boxShadow: 'none' }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        <Can requiredPermission="canCreateGroups">
                            <button
                                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center"
                                onClick={() => setShow(true)}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                New Group
                            </button>
                        </Can>
                    </div>
                </div>
            </div>

            <hr className="mb-5 opacity-10" />

            {groups.length === 0 && !loading && (
                <div className="text-center py-5 bg-light rounded-5 border border-dashed border-primary border-opacity-25 shadow-inner">
                    <div className="bg-white rounded-circle d-inline-flex p-4 mb-4 shadow-sm">
                        <i
                            className="bi bi-people text-primary"
                            style={{ fontSize: "3rem" }}
                        ></i>
                    </div>
                    <h4 className="fw-bold">No Groups Found</h4>
                    <p
                        className="text-muted mx-auto mb-4"
                        style={{ maxWidth: "400px" }}
                    >
                        You haven't joined any groups yet. Create a group to
                        start splitting bills with your friends or roommates!
                    </p>
                    <Can requiredPermission="canCreateGroups">
                        <button
                            className="btn btn-outline-primary rounded-pill px-4"
                            onClick={() => setShow(true)}
                        >
                            Get Started
                        </button>
                    </Can>
                </div>
            )}

            {groups.length > 0 && (
                <>
                    <div className={`row g-4 animate__animated animate__fadeIn ${loading ? 'opacity-50' : ''}`}>
                        {groups.map((group) => (
                            <div className="col-md-6 col-lg-4" key={group._id}>
                                <GroupCard
                                    group={group}
                                    onUpdate={handleGroupUpdateSuccess}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Nav */}
                    <nav aria-label="Page navigation" className="mt-5">
                        <ul className="pagination justify-content-center border-0 gap-2">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link rounded-circle border-0 shadow-sm bg-white text-primary d-flex align-items-center justify-content-center"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    &laquo;
                                </button>
                            </li>

                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button
                                        className={`page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-white text-primary'}`}
                                        onClick={() => handlePageChange(index + 1)}
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link rounded-circle border-0 shadow-sm bg-white text-primary d-flex align-items-center justify-content-center"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    &raquo;
                                </button>
                            </li>
                        </ul>
                    </nav>
                </>
            )}

            <CreateGroupModal
                show={show}
                onHide={() => setShow(false)}
                onSuccess={handleGroupUpdateSuccess}
            />
        </div>
    );
}

export default Groups;
