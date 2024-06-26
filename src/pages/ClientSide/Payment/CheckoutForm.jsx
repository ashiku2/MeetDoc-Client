import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useContext, useEffect, useState } from 'react';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { AuthContext } from '../../../provider/AuthProvider';
import Swal from 'sweetalert2';


const CheckoutForm = ({meeting}) => {
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const stripe = useStripe();
    const elements = useElements();
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [transactionId, setTransactionId] = useState('');
    console.log(meeting);


    useEffect(() => {
        axiosPublic.post('/create-payment-intent', { price: meeting.fee })
            .then(res => {
                console.log(res.data.clientSecret);
                setClientSecret(res.data.clientSecret);
        })
    }, [axiosPublic, meeting.fee])

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return
        }

        const card = elements.getElement(CardElement);
        if (card == null) {
            return
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card
        })

        if (error) {
            console.log('payment error', error);
            setError(error.message )
        }
        else {
            console.log('payment method', paymentMethod);
            setError(''); 
        }

        // confirm payment
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    email: user?.email || 'anonymous',
                    name: user?.displayName || 'anonymous'

                }
            }
        })

        if (confirmError) {
            console.log('confirm error')
        }
        else {
            console.log('payment intent', paymentIntent);
            if (paymentIntent.status === 'succeeded') {
                console.log('transaction id', paymentIntent.id);
                setTransactionId(paymentIntent.id);
                const data = {
                    email: user.email,
                    price: meeting.fee,
                    date: new Date(),
                    meeting_id: meeting._id,
                    patient_email: meeting.email,
                    doc_email: meeting.doc_email,
                    transactionId: paymentIntent.id


                }
                axiosPublic.patch(`/acceptPayment/${meeting._id}`)
                    .then(res => {
                        if (res.data.modifiedCount > 0) {
                           
                            Swal.fire({
                                position: "top-end",
                                icon: "success",
                                title: `Payment is accepted`,
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }

                    })
                
                const res = await axiosPublic.post('/stripePay', data);
                console.log('payment saved', res);
            }
        }

    }
    return (
        <div className='min-h-screen'>
            <form onSubmit={handleSubmit}>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
                <button className='btn mt-6 btn-primary' type="submit" disabled={!stripe || !clientSecret}>
                    Pay
                </button>
                <p className="text-red-600">{error}</p>
                {transactionId &&
                    <p className="text-green-600">Your transaction id: {transactionId}</p>

                }
            </form>
        </div>
    );
};

export default CheckoutForm;