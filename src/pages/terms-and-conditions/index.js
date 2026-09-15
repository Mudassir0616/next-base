import { useSiteSetting } from '@/context/useSiteSettings';
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import React from 'react'

const Index = () => {
    const { settings } = useSiteSetting();

    return (
        <div className="container">

            <Breadcrumbs aria-label="breadcrumb" sx={{ padding: { lg: '15px 0', xs: '10px 0' } }}>
                <Link underline="hover" color="inherit" href="/">
                    Home
                </Link>
                <p>Terms & Conditions</p>
            </Breadcrumbs>


            <div className="my-10">
                <h1 className='title-color'>Terms & Conditions</h1>
            </div>

            <div className="terms" dangerouslySetInnerHTML={{ __html: settings?.terms_and_conditions }}></div>
        </div>
    )
}

export default Index