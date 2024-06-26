import React, { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from "@tanstack/react-query";

const useAdmin = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const { data: isAdmin, isPending: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        enabled: !loading,
        queryFn: async () => {
            const res = await axiosPublic.get(`/users/admin/${user.email}`);
            console.log(res)
            return res.data?.admin;
        }
    })
    return [isAdmin, isAdminLoading];

};

export default useAdmin;