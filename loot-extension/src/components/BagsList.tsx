import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function BagsList() {

    const myBags: any = useSelector<any>(state => state.myBags.value);


    return (
        <div className="bag-list">
            {myBags.map((bag:any) => {
                return <div key={bag} className='bag-visual'>{bag}</div>  
            })}
        </div>
    )
}