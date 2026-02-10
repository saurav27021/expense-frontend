import { useSelector } from "react-redux";

export const ROLE_PERMISSIONS = {
    admin: {
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canViewUsers: true,
        canCreateGroups: true,
        canUpdateGroups: true,
        canDeleteGroups: true,
        canViewGroups: true,
    },
    manager: {
        canCreateUsers: false,
        canUpdateUsers: true,
        canDeleteUsers: false,
        canViewUsers: true,
        canCreateGroups: true,
        canUpdateGroups: true,
        canDeleteGroups: false,
        canViewGroups: true,
    },
    viewer: {
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canViewUsers: true,
        canCreateGroups: false,
        canUpdateGroups: false,
        canDeleteGroups: false,
        canViewGroups: true,
    },
};

export const usePermission = () => {
    const role = useSelector((state) => state.userDetails?.role);
    return ROLE_PERMISSIONS[role] ?? {};
};
