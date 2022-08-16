import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Box, Button, TextField, Alert } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';

import TripLocationSearch from './TripLocationSearch';
import {
	changeAccommodationEndDate,
	changeAccommodationStartDate,
	selectNewAccommodation,
	submitAccommodationLocation,
} from '../../../features/createAccommodation/createAccommodationSlice';
import { addAccommodation } from '../../../features/createAccommodation/accommodationList';

type Props = {
	setShowAccommodation: React.Dispatch<React.SetStateAction<boolean>>;
};

// const AddTravelSchema = yup.object().shape({
// 	name: yup.string().required('Name is required'),
// 	startDate: yup.string().required('Please select a start date'),
// 	endDate: yup.string().required('Please select an end date'),
// });

const AddAccommodationSchema = yup.object().shape({
	checkinDate: yup.string().required('Please select a start date'),
	checkoutDate: yup.string().required('Please select an end date'),
});
// const AddTravelSchema = yup.object().shape({
// 	departureLocation: yup.mixed().required('Please select a departure location'),
// 	arrivalLocation: yup.mixed().required('Please select an arrival location'),
// 	departureDateTime: yup
// 		.string()
// 		.required('Please select departure date and time'),
// 	flightNumber: yup.string(),
// });

function AddAccommodationForm(props: Props) {
	const alertRef: React.MutableRefObject<boolean> = useRef(false);
	const { setShowAccommodation } = props;
	const dispatch = useAppDispatch();
	const newAccommodation = useAppSelector(selectNewAccommodation);
	// const newTrip = useAppSelector(selectNewTrip);

	const {
		register,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm<any>({
		resolver: yupResolver(AddAccommodationSchema),
	});

	const handleStartDate = (event: any) => {
		dispatch(changeAccommodationStartDate(event.target.value));
		setValue('checkinDate', event.target.value, { shouldValidate: true });
	};
	const handleEndDate = (event: any) => {
		dispatch(changeAccommodationEndDate(event.target.value));
		setValue('checkoutDate', event.target.value, { shouldValidate: true });
	};

	const onSubmit = async (data: any) => {
		console.log('in', data);
		const isValid = await AddAccommodationSchema.isValid(data);
		console.log(isValid);
		if (!isValid || !newAccommodation.location) {
			alertRef.current = true;
		}
		if (isValid && newAccommodation.location) {
			dispatch(addAccommodation(newAccommodation));
			setShowAccommodation(false);
			dispatch(submitAccommodationLocation(null));
			dispatch(changeAccommodationStartDate(null));
			dispatch(changeAccommodationEndDate(null));
			setValue('checkinDate', null);
			setValue('checkoutDate', null);
		}
	};

	return (
		<div className="add-accommodation-form">
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb={2}>
					<TripLocationSearch inputLabel="accommodationLocation" />
					{alertRef.current ? (
						<Alert severity="error">Please insert a location!</Alert>
					) : null}
					<TextField
						id="checkinDate"
						label="Check-in date"
						type="date"
						sx={{ width: 220 }}
						{...register('checkinDate')}
						error={!!errors.checkinDate}
						InputLabelProps={{
							shrink: true,
						}}
						onChange={handleStartDate}
					/>
					<TextField
						id="checkoutDate"
						label="Check-out date"
						type="date"
						sx={{ width: 220 }}
						{...register('checkoutDate')}
						error={!!errors.checkoutDate}
						InputLabelProps={{
							shrink: true,
						}}
						onChange={handleEndDate}
					/>
					<Button type="submit" aria-label="Save accommodation">
						Save
					</Button>
				</Box>
			</form>
		</div>
	);
}

export default AddAccommodationForm;
