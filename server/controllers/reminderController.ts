require("dotenv").config();
import { Request, Response } from "express";
import { Logger } from "../middlewares/logger";
import db from "../models";
import moment = require("moment-timezone");
import e = require("express");
const webPush = require("web-push");

export const sendUserReminders = async (req: Request, res: Response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  // Set vapid keys
  webPush.setVapidDetails("mailto:test@gmail.com", publicKey, privateKey);

  try {
    const userUID = req.params.uid;
    const timeForAppointments = 1;

    // Retrieve subscription from database
    const Usersubscription = await db.Subscription.findOne({
      where: {
        uid: userUID,
      },
    });

    if (!Usersubscription) {
      return res.status(404).json({
        status: "ERROR",
        message: `No Subscription was found.`,
      });
    } 

    const subscription = Usersubscription.subscription;

    // Get the current time and date
    const currentTime = moment.tz("America/Toronto").format("HH:mm:00");
    const currentDate = moment.tz("America/Toronto").format("YYYY-MM-DD");

    // Calculate the start time that is exactly 3 hours ahead of the current time for appointments
    const startTimeAppointments = moment(currentTime, "HH:mm:ss").add(
      3,
      "hours"
    );

    // Calculate the end time for appointments which is 30-minutes ahead of the start time
    const endTimeAppointments = startTimeAppointments
      .clone()
      .add(30, "minutes");

    // Calculate the start time and end time of the 30-minute period of notifications
    const startTime = moment(currentTime, "HH:mm:ss");
    const endTime = startTime.clone().add(30, "minutes");

   

    // Retrieve notification preference first. Make sure
    const userNotificationPreferences = await db.NotificationPreference.findOne(
      {
        where: {
          uid: userUID,
        },
      }
    );


    // Return if there's an error
    if (!userNotificationPreferences) {
      return res.status(404).json({
        status: "ERROR",
        message: `Notification preference not found, invalid user id.`,
      });
    } 

    // Check if user has appointment notifications on
    if (userNotificationPreferences.appointmentReminders) {
  
      //Get appointment of users for preperaing reminder
      const userAppointments = await db.Appointment.findAll({
        where: {
          uid: userUID,
          date: currentDate,
          time: {
            [db.Sequelize.Op.gte]: startTimeAppointments.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTimeAppointments.format("HH:mm:00"),
          },
        },
      });
      
      if (userAppointments.length > 0) {
        userAppointments.forEach(
          (appointment: { appointmentWith: any; time: any }) => {
            const payload = JSON.stringify({
              title: `Appointment Reminder with Dr ${appointment.appointmentWith} at ${appointment.time}`,
            });
            webPush
              .sendNotification(subscription, payload)
              .catch((error: any) => console.log(error));
          }
        );
      }
    }

    // Check if user has activity notifications on
    if (userNotificationPreferences.activityReminders) {
      //Get activity journals of users for prepearing reminder
      const userActivityJournals = await db.ActivityJournal.findAll({
        where: {
          uid: userUID,
          date: currentDate,
          time: {
            [db.Sequelize.Op.gte]: startTime.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTime.format("HH:mm:00"),
          },
        },
      });
      
      if (userActivityJournals.length > 0) {
        userActivityJournals.forEach(
          (activityjournal: { activityjournal: any }) => {
            const payload = JSON.stringify({
              title: `Activity Reminder `,
            });
            webPush
              .sendNotification(subscription, payload)
              .catch((error: any) => console.log(error));
          }
        );
      }
    }

    // Check if user has food intake notifications on
    if (userNotificationPreferences.foodIntakeReminders) {
      //Get food intake journals of users for preparing reminder
      const userFoodIntakeJournals = await db.FoodIntakeJournal.findAll({
        where: {
          uid: userUID,
          date: currentDate,
          time: {
            [db.Sequelize.Op.gte]: startTime.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTime.format("HH:mm:00"),
          },
        },
      });
      if (userFoodIntakeJournals.length > 0) {
        userFoodIntakeJournals.forEach(
          (userFoodIntakeJournal: { userFoodIntakeJournal: any }) => {
            const payload = JSON.stringify({
              title: `Food Intake Reminder `,
            });
            webPush
              .sendNotification(subscription, payload)
              .catch((error: any) => console.log(error));
          }
        );
      }
    }

    // Check if user has glucose measurement notifications on
    if (userNotificationPreferences.glucoseMeasurementReminders) {
      //Get diabetic sub-journal1 of users for preparing remindner
      const userGlucoseMeasurement = await db.GlucoseMeasurement.findAll({
        where: {
          uid: userUID,
          mealTime: {
            [db.Sequelize.Op.gte]: startTime.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTime.format("HH:mm:00"),
          },
          date: currentDate,
        },
      });
      if (userGlucoseMeasurement.length > 0) {
        userGlucoseMeasurement.forEach(
          (GlucoseMeasurement: { GlucoseMeasurement: any }) => {
            const payload = JSON.stringify({
              title: `GlucoseMeasurement Reminder `,
            });
            webPush
              .sendNotification(subscription, payload)
              .catch((error: any) => console.log(error));
          }
        );
      }
    }

    // Check if user has insulin dosage notifications on
    if (userNotificationPreferences.insulinDosageReminders) {
      //Get diabetic sub-journal2 of users for preparing reminder
      const userInsulinDosage = await db.InsulinDosage.findAll({
        where: {
          uid: userUID,
          date: currentDate,
          time: {
            [db.Sequelize.Op.gte]: startTime.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTime.format("HH:mm:00"),
          },
        },
      });
      if (userInsulinDosage.length > 0) {
        userInsulinDosage.forEach((InsulinDosage: { InsulinDosage: any }) => {
          const payload = JSON.stringify({
            title: `Insulin Dosage Reminder `,
          });
          webPush
            .sendNotification(subscription, payload)
            .catch((error: any) => console.log(error));
        });
      }
    }

    // Check if user has medication notifications on
    if (userNotificationPreferences.medicationReminders) {
      //Get medication of user for preparing reminder
      const userMedication = await db.Medication.findAll({
        where: {
          uid: userUID,
          time: {
            [db.Sequelize.Op.gte]: startTime.format("HH:mm:00"),
            [db.Sequelize.Op.lt]: endTime.format("HH:mm:00"),
          },
        },
      });
      if (userMedication.length > 0) {
        userMedication.forEach((Medication: { Medication: any }) => {
          const payload = JSON.stringify({
            title: `Medication Reminder `,
          });
          webPush
            .sendNotification(subscription, payload)
            .catch((error: any) => console.log(error));
        });
      }
    }

    res.status(200).json({
      status: `SUCCESS`,
    });
  } catch (err) {
    Logger.error(`Error occurred while fetching reminders for user: ${err}`);
    res.status(400).json({
      status: `ERROR`,
      message: `Error getting reminders of user : ${err}`,
    });
  }
};