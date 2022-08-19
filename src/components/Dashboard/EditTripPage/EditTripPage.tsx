import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Button, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DragDropContext } from 'react-beautiful-dnd';
import EditTripActivitiesContainer from './EditTripActivitiesContainer';
import SelectedTrip from './SelectedTrip';
// import mock from '../../../utils/mockActivities';
import { tripDateFormatter } from '../../../utils/dateUtils';
import {
	selectTripDetails,
	selectTripId,
	setSelectedTrip,
} from '../../../features/createTrip/selectedTripSlice';
import { BASE_URL } from '../../../features/createTrip/createTripService';

// const tripDetails = {
// 	id: 'cl6yzxnjx03885zuohu5zw6kk',
// 	createdAt: '2022-08-18T12:05:46.749Z',
// 	userId: 'cl6yvhyd600475zuop6gba6xg',
// 	startDate: '2023-07-02T00:00:00.000Z',
// 	endDate: '2023-07-06T00:00:00.000Z',
// 	name: 'Euro Trip - Barcelona',
// 	tripDay: [
// 		{
// 			id: 'cl6yzxnjx03895zuo323oyknm',
// 			dayIndex: 0,
// 			tripId: 'cl6yzxnjx03885zuohu5zw6kk',
// 			tripDayActivities: [],
// 		},
// 		{
// 			id: 'cl6yzxnjx03905zuokpfa6lds',
// 			dayIndex: 1,
// 			tripId: 'cl6yzxnjx03885zuohu5zw6kk',
// 			tripDayActivities: [],
// 		},
// 		{
// 			id: 'cl6yzxnjx03915zuo0m6xq9ud',
// 			dayIndex: 2,
// 			tripId: 'cl6yzxnjx03885zuohu5zw6kk',
// 			tripDayActivities: [],
// 		},
// 		{
// 			id: 'cl6yzxnjx03925zuoifyycuj3',
// 			dayIndex: 3,
// 			tripId: 'cl6yzxnjx03885zuohu5zw6kk',
// 			tripDayActivities: [],
// 		},
// 		{
// 			id: 'cl6yzxnjx03935zuoochl05rs',
// 			dayIndex: 4,
// 			tripId: 'cl6yzxnjx03885zuohu5zw6kk',
// 			tripDayActivities: [],
// 		},
// 	],
// };
//  Your Saved Activities
// const favoritedActivities = {
// 	ActivitiesList: mock,
// };

//  Your Trip Days
// const tripDays = {
// 	Mon: [],
// 	Tues: [],
// 	Wed: [],
// 	Thurs: [],
// 	Fri: [],
// };

//	Handle All Of The Drag Logic
const onDragEnd = (
	result: any,
	days: any,
	setDays: any,
	savedActivities: any,
	setSavedActivities: any
) => {
	const { source, destination } = result;
	//	/////////FAIL CHECKS/////////////////////
	//	CHECK: DROPPING AT A DROPPPABLE LOCATION
	console.log(result);
	if (!result.destination) {
		const dayActivities = [...days[source.droppableId]];

		dayActivities.splice(source.index, 1);
		setDays({
			...days,
			[source.droppableId]: dayActivities,
		});

		console.log('remove me!');
		return;
	}

	//	IF SOURCE & DEST IS SAVED ACTIVITIES

	if (
		source.droppableId === 'favoritedActivities' &&
		destination.droppableId === 'favoritedActivities'
	) {
		console.log('Dont Drop Here');
		return;
	}

	//	IF SOURCE IS DAY && DEST IS SAVED ACTIVITIES
	if (
		source.droppableId !== 'favoritedActivities' &&
		destination.droppableId === 'favoritedActivities'
	) {
		console.log('Dont Drop Here');
		return;
	}
	//	/////////SUCCESS/////////////////////

	//	IF SOURCE=SAVED ACTIVITES & DEST=DAY
	if (source.droppableId === 'favoritedActivities') {
		//	identify source and dest activities
		const sourceActivities = [...savedActivities.ActivitiesList];
		const destActivities = [...days[destination.droppableId]];
		//	remove act from source, and add to dest
		const [removed] = sourceActivities.splice(source.index, 1);
		const removedCopy = { ...removed, id: removed.id.concat('x') };
		//	add the activity that was removed to the dest activities
		destActivities.splice(destination.index, 0, removed);
		// add the copy of the removed activity, with a new id, to the source activities
		sourceActivities.push(removedCopy);
		//	set the days
		console.log('destdropid:', destination.droppableId);
		setDays({
			...days,
			[destination.droppableId]: destActivities,
		});
		//	set your act list
		setSavedActivities({
			ActivitiesList: sourceActivities,
		});

		return;
	}

	//	IF SOURCE & DEST ARE DIFFERENT DAYS
	if (
		source.droppableId !== 'favoritedActivities' &&
		source.droppableId !== destination.droppableId
	) {
		//	identify source activities
		const sourceActivities = [...days[source.droppableId]];

		//	identify destactivities
		const destActivities = [...days[destination.droppableId]];

		const [removed] = sourceActivities.splice(source.index, 1);
		destActivities.splice(destination.index, 0, removed);

		setDays({
			...days,
			[source.droppableId]: sourceActivities,
			[destination.droppableId]: destActivities,
		});
		return;
	}
	//	IF SOURCE & DEST ARE THE SAME DAY
	if (
		source.droppableId !== 'favoritedActivities' &&
		source.droppableId === destination.droppableId
	) {
		const activities = [...days[source.droppableId]];
		const [removed] = activities.splice(source.index, 1);
		activities.splice(destination.index, 0, removed);
		setDays({
			...days,
			[source.droppableId]: activities,
		});
	}
};

function EditTripPage() {
	const dispatch = useDispatch();
	const id = useSelector(selectTripId);
	const { tripDetails } = useSelector(selectTripDetails);
	//  eslint-disable-next-line
	const [savedActivities, setSavedActivities] = useState<any>(null);
	//  eslint-disable-next-line
	const [days, setDays] = useState<any>(null);

	//	//////////////////1. GET DETAILS OF TRIP /////////////////
	useEffect(() => {
		const getTripDetails = async () => {
			//	TRIPID FAIL CHECK DO NOT REMOVE
			//		THIS USEEFFECT NOW WATCH THE TRIPID VALUE AND WILL GET CALLED WHEN IT CHANGES
			if (id) {
				try {
					const fetchTripDetails = await fetch(
						`${BASE_URL}trip/tripById/${id}`
					);
					const jsonTripDetails = await fetchTripDetails.json();
					console.log('json', jsonTripDetails);
					dispatch(setSelectedTrip(jsonTripDetails));
				} catch (e) {
					console.log(e);
				}
			}
		};
		getTripDetails();
	}, [id]);
	//	//////////////////2. SET YOUR TRIP DAYS STATE /////////////////

	useEffect(() => {
		if (!tripDetails) return;
		const dateList = tripDateFormatter(
			tripDetails.startDate,
			tripDetails.tripDay.length
		);
		//  eslint-disable-next-line
		const tripDayMap: any = {};
		//  eslint-disable-next-line
		tripDetails.tripDay.forEach((day: any) => {
			tripDayMap[dateList[day.dayIndex]] = day.tripDayActivities;
		});
		setDays(tripDayMap);
	}, [tripDetails]);

	//	//////////////////3. SET YOUR TRIP ACTIVITIES STATE /////////////////

	useEffect(() => {
		const getActivities = async () => {
			try {
				const activities = await fetch(`${BASE_URL}activity/all`);
				const jsonActivities = await activities.json();
				setSavedActivities({
					ActivitiesList: jsonActivities,
				});
			} catch (e) {
				console.log(e);
			}
		};
		getActivities();
	}, []);

	return (
		<>
			{/* eslint-disable-next-line */}
			{days && savedActivities ? (
				<DragDropContext
					onDragEnd={(result) =>
						onDragEnd(
							result,
							days,
							setDays,
							savedActivities,
							setSavedActivities
						)
					}
				>
					<Box
						style={{
							display: 'flex',
							width: '100vw',
						}}
					>
						<Paper
							elevation={20}
							sx={{
								borderRadius: 3,
								padding: '1vw 0 0 2vw',
							}}
						>
							<Typography variant="h3" style={{ margin: '0 0 2.5vw 0' }}>
								{tripDetails.name}
							</Typography>
							<SelectedTrip days={days} />
						</Paper>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								width: '50vw',
								alignItems: 'center',
							}}
						>
							<Box sx={{ display: 'flex', gap: 10, margin: '1vw 0 0 0' }}>
								<Button>Activities</Button>
								<Button>Map</Button>
							</Box>
							<Box sx={{ display: 'flex', gap: 10, margin: '0.5vw 0 0 0' }}>
								<Button variant="contained">Add Activity</Button>
								<Button variant="contained">Add Travel</Button>
								<Button variant="contained">Add Accomodation</Button>
							</Box>
							<div style={{ margin: '3vw 0 0 5vw' }}>
								<EditTripActivitiesContainer
									savedActivities={savedActivities}
								/>
							</div>
						</Box>
					</Box>
				</DragDropContext>
			) : (
				<>nope</>
			)}
		</>
	);
}

export default EditTripPage;
