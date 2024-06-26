import React from 'react';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { FaTrash } from 'react-icons/fa6';
import Swal from 'sweetalert2';


const ManageMedicine = () => {

    const axiosPublic = useAxiosPublic();
    const { data: medicines = [], refetch } = useQuery({
        queryKey: ['medicines'],
        queryFn: async () => {
            const res = await axiosPublic.get('/medicines');
            return res.data;
        }
    })


    const handleDeleteMedicine = (medicine) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {

                axiosPublic.delete(`/medicines/${medicine._id}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Medicine Deleted from database",
                                icon: "success"
                            });
                            refetch();
                        }
                    })


            }
        });
    }

    return (
        <div>
            <Helmet>
                <title>Dashboard | Manage Medicine</title>
            </Helmet>
            <div className='flex justify-evenly'>
                <h1 className='text-3xl'>All Medicine</h1>
                <h1 className='text-3xl'>Total Medicines: {medicines.length}</h1>
            </div>
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Medicine Name</th>
                            <th>Image</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            medicines.map((medicine, index) =>
                                <tr key={medicine._id}>
                                    <th className=''>{index + 1}</th>
                                    <td className='text-2xl'>{medicine.name}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="w-24 mask mask-squircle">
                                                <img src={medicine.image} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='text-2xl'>৳{medicine.price }</td>
                                    <td>
                                        <button onClick={() => handleDeleteMedicine(medicine)} className="btn btn-ghost btn-2xl"><FaTrash></FaTrash></button>
                                    </td>
                                </tr>)

                        }


                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageMedicine;