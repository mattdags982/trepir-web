import React, { useState } from 'react';

import { Button, Divider } from '@mui/material';

import { useAppSelector } from '../../../app/hooks';

import { selectNewAccommodation } from '../../../features/createAccommodation/createAccommodationSlice';
import { selectAccommodationList } from '../../../features/createAccommodation/accommodationList';
import TravelEventList from './TravelEventList';
import AddAccommodationForm from './AddAccommodationForm';

type Props = {
	submitRef: any;
	setValidated: React.Dispatch<React.SetStateAction<boolean>>;
	setActiveStep: React.Dispatch<React.SetStateAction<number>>;
};

function FormStepTwo(props: Props) {
	const [showAccommodation, setShowAccommodation] = useState(false);
	const [showTravel, setShowTravel] = useState(false);
	const accommodationList = useAppSelector(selectAccommodationList);
	const newAccommodation = useAppSelector(selectNewAccommodation);
	console.log(newAccommodation);
	// const newTrip = useAppSelector(selectNewTrip);

	const { submitRef, setValidated, setActiveStep } = props;

	const handleClick = () => {
		console.log('hello');
		setValidated(true);
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	return (
		<div>
			<Button
				variant="contained"
				disabled={showTravel}
				onClick={() => setShowAccommodation(true)}
			>
				Add Accommodation
			</Button>
			<Button
				variant="contained"
				disabled={showAccommodation}
				onClick={() => setShowTravel(true)}
			>
				Add Travel Details
			</Button>
			{showAccommodation ? (
				<AddAccommodationForm setShowAccommodation={setShowAccommodation} />
			) : null}
			{showTravel ? <p>Show travel</p> : null}
			<button
				ref={submitRef}
				type="button"
				onClick={handleClick}
				style={{ display: 'none' }}
				aria-label="Submit step"
			/>
			<Divider />
			{accommodationList.length &&
				accommodationList.map((event) => <TravelEventList event={event} />)}
		</div>
	);
}

export default FormStepTwo;
