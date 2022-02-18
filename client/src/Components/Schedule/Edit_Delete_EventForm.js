import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useForm, Controller, set } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../Firebase/firebase-config";
import { date } from "yup";
import { InputLabel } from "@mui/material";

// Schema for register form
const schema = yup.object().shape({
  title: yup.string().required("title is required"),
  //   service: yup.string().required("service is required"),
});


const availability = [
  {
    status: "Booked",
    id: 1,
  },
  {
    status: "Available",
    id: 2,
  },
];


export default function EditDeleteEventForm(props) {
  const { removeEvents, method, services} = props

 
  const [eventTitle, setEventTitle] = useState(removeEvents.data.event.title);
  const [eventData, setEventData] = useState([]);
  const [selectedService, setSelectedService] = React.useState(removeEvents.data.event.title);
  const [booking, setBooking] = React.useState(removeEvents.data.event.extendedProps.status);
  const [extendedForm, setExtendedForm] = React.useState(true);
  const [name, setName] = React.useState(removeEvents.data.event.extendedProps.name)
  const [phoneNumber, setPhoneNumber] = React.useState(removeEvents.data.event.extendedProps.number)
  const [email, setEmail] = React.useState(removeEvents.data.event.extendedProps.email)
  const [notes, setNotes] = React.useState(removeEvents.data.event.extendedProps.notes)
 

  


  console.log("you selected the following event", eventData)
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    formState,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  //   const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log("Getting documents")
    let collectionRef = collection(db, "events");
    let queryRef = query(
      collectionRef,
      where("uid", "==", currentUser.uid),
      where("start_time", "==", removeEvents.data.event.startStr)
    );
    console.log("Getting Documents 2")
    const unsubscribe = onSnapshot(queryRef, (querySnap) => {
      if (querySnap.empty) {
        console.log("No docs found");
      } else {
        let EventsData = querySnap.docs.map((doc) => {
          return {
            ...doc.data(),
            DOC_ID: doc.id,
          };
        });
        console.log("get documents")
        setEventData(EventsData[0]);
      }
    });
    return unsubscribe;
  }, [removeEvents.data.event]);


 

  // Function takes a unique id as input in order to delete selected event. Unique id is retrieved using getselectedDoc function
  const deleteEvent = (id) => {
    const eventDoc = doc(db, "events", id);
    return deleteDoc(eventDoc);
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  const eventDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${removeEvents.data.event.title}'`
      )
    ) {
      const id = eventData.DOC_ID;
      console.log(id)
      deleteEvent(id);
      removeEvents.data.event.remove();
    }
    method();
  };

  const updateHandler = async (e) => {
      let color = ""

      // if booking is true i.e event is now booked change the color of event to red
      if (booking === "Booked") {
        color = "#ff0000"
      }

      const id = eventData.DOC_ID
      const EventDoc = doc(db, "events", id);
      console.log(EventDoc)
      await updateDoc(EventDoc ,{
      title: selectedService,
      status: booking,
      color: color,
      customer_name: name,
      customer_phone_number: phoneNumber,
      customer_email: email,
      notes: notes
   })
   method();

    }
  

  useEffect(() => {
   if (removeEvents.data.event.extendedProps.status === "Booked") {
     setExtendedForm(true)
   } else
   setExtendedForm(false)
  }, [])

  const handleAvailability = (event) => {
      setBooking(event.target.value)
      
      if (event.target.value === "Booked") {
        setExtendedForm(true)
      } else
      setExtendedForm(false)
      
    }

  const handleChange = (event) => {
      console.log(event.target.value);
      setSelectedService(event.target.value);
     
    }

  const handleCancel = () => {
    method(); // close modal
  };

  const handleName = (event) => {
    setName(event.target.value)
  }

 
  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Add Events
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
             <Grid container flex-direction="row" spacing={2}>
              <Grid item xs={6} sm={6}>
                <FormControl
                  fullwidth="true"
                  sx={{
                    width: 200,
                    height: 75,
                  }}
                >
                  <InputLabel id="title">
                    <em>Select a Service</em>
                  </InputLabel>
                  <Controller
                    name="title"
                    // defaultValue="some value"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Select
                        onChange={handleChange}
                        value={selectedService}
                        id="title"
                        // displayEmpty
                        defaultValue={removeEvents.data.event.title}
                      >
                        <MenuItem value=""></MenuItem>
                        {services.map((service) => {
                          return (
                            <MenuItem
                              key={service.DOC_ID}
                              value={service.service}
                            >
                              {service.service}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    )}
                  />
                </FormControl>
                </Grid>
                <Grid item xs={6} sm={6}>
                <FormControl
                  fullwidth="true"
                  sx={{
                    width: 200,
                    height: 75,
                  }}
                >
                  <InputLabel id="title">
                    <em>Select Availability</em>
                  </InputLabel>
                  <Controller
                    name="title"
                    defaultValue=""
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Select
                        onChange={handleAvailability}
                        value={availability.status}
                        id="title"
                        defaultValue={removeEvents.data.event.extendedProps.status} 
                      >
                        <MenuItem value=""></MenuItem>
                        {availability.map((available) => {
                          return (
                            <MenuItem
                              key={available.id}
                              value={available.status}
                            >
                              {available.status}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {extendedForm && 
            <>
            <Grid container flex-direction="row" spacing={2} >
              <Grid item xs={12} sm={12} sx={{mt:1}}>
                <Controller
                  name="Name"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      onChange={(e) => setName(e.target.value)}
                      value={value}
                      onBlur={onBlur}
                      defaultValue={removeEvents.data.event.extendedProps.name}
                      autoComplete="given-name"
                      name="Name"
                      required
                      fullWidth="true"
                      id="Name"
                      label="Customer Name"
                      autoFocus
                      error={!!errors.Name}
                      helperText={errors.Name?.message}
                    />
                  )}
                  />
            </Grid>
            </Grid>
            <br></br>
              <Grid item xs={12} sm={12}>
                <Controller
                  name="Phone_Number"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      value={value}
                      onBlur={onBlur}
                      defaultValue={removeEvents.data.event.extendedProps.number}
                      // autoComplete="given-name"
                      name="Phone_Number"
                      required
                      fullWidth="true"
                      id="Name"
                      label="Phone Number"
                      autoFocus
                      error={!!errors.Phone_Number}
                      helperText={errors.Phone_Number?.message}
                    />
                  )}
                  />
            </Grid>
            <br></br>
              <Grid item xs={12} sm={12}>
                <Controller
                  name="Email"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      onChange={(e) => setEmail(e.target.value)}
                      value={value}
                      onBlur={onBlur}
                      defaultValue={removeEvents.data.event.extendedProps.email}
                      name="Email"
                      required
                      fullWidth="true"
                      id="Email"
                      label="Email"
                      autoFocus
                      error={!!errors.Email}
                      helperText={errors.Email?.message}
                    />
                  )}
                  />
            </Grid>
            <br></br>
              <Grid item xs={12} sm={12}>
                <Controller
                  name="Notes"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      onChange={(e) => setNotes(e.target.value)}
                      value={value}
                      onBlur={onBlur}
                      defaultValue={removeEvents.data.event.extendedProps.notes}
                      name="Notes"
                      required
                      multiline
                      fullWidth="true"
                      id="Notes"
                      label="Notes"
                      autoFocus
                      error={!!errors.Notes}
                      helperText={errors.Notes?.message}
                    />
                  )}
                  />
            </Grid>
            </>
            }
            <Button
              //type="submit"
              fullWidth
              variant="contained"
              //disabled={!formState.isValid}
              sx={{ mt: 3, mb: 2 }}
              onClick={eventDelete}
            >
              Delete
            </Button>
            <Button 
              fullWidth
              color="error"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              color="secondary"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={updateHandler}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Container>
  );
}
