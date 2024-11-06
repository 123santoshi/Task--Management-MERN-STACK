Task Management Dashboard Features (MERN Stack): 

This project is designed with two key dashboards **Admin Dashboard and User Dashboard** providing distinct functionalities to manage tasks efficiently and track performance.

### Used Languages:
- **HTML**: Used for structuring the content of web pages.
- **CSS**: Provides the style and layout for web pages, making them visually appealing.
- **Tailwind CSS**: Utility-first CSS framework for rapidly building custom designs without leaving HTML.
- **React JS**: Frontend library for building user interfaces with reusable components and state management.
- **Node JS**: JavaScript runtime for building scalable server-side applications.
- **Express JS**: Web framework for Node.js to handle HTTP requests and routing easily.
- **MongoDB**: NoSQL database to store and retrieve data in a flexible, JSON-like format.

### Libraries:
- **React Toastify**: Provides elegant, customizable notifications in the UI.
- **Recharts**: Used for creating interactive and responsive bar charts and visual data representation.
- **React-datepicker**: Allows users to easily select dates from a visual calendar in forms.
  
### Backend Libraries:
- **Nodemailer**: Enables sending emails directly from the server.
- **Cron**: Schedules tasks to run automatically at specified intervals.


Implemented Features in this project :

1. Signup & OTP-Based Login :
   -> Signup : Users can register by entering their username and email id  on the signup page.
   -> Login OTP Authentication: Login functionality is based on One-Time Password (OTP) authentication. Once a user enters their email, an OTP is sent to them, which they need to enter to complete the login process. This adds an extra layer of security.

Admin Dashboard Features : 

The Admin Dashboard provides complete control over task and user management, along with detailed insights and reports. Below are the features of the Admin Dashboard:

1. Users Module :
- **Add Single User**: Admin can add a new user by providing essential details like name, email, role, etc.
- **Add Multiple Users at Once**: This feature allows the admin to upload multiple users simultaneously, reducing manual input time.
- **Search for Users**: Admin can easily search for users by their name, email.
- **Download User Data**: Admin can export the list of users into a downloadable file .
- **Active & Inactive Users List**: The dashboard separates active users and inactive users.
- **Inactivating & Deleting Users** : Admin can deactive the users if they don't wwant .Whenever they want the user they can set as active otherwise they can delete completely from the dashboard.


2. Task Management Module:
- **Add Single Task**: Admin can create a new task with details like task name, description, assigned user, start date, end date, and priority level.
- **Add Multiple Tasks at Once**: Allows the admin to upload tasks in bulk, saving time when creating several tasks at once.
- **Set Task Priorities**: Each task can be assigned a priority level (e.g., High, Medium, Low), allowing the admin to track urgent tasks.
- **Update Task Status**: Tasks can have statuses such as "Not Started," "In Progress," "Completed," etc. Admins can update these statuses to track task progress.
- **Manual Time Logging**: Users can manually log the time they spend on each task, ensuring accurate tracking of efforts.
- **Automatic Time Logging**: An automated time log system captures the time spent on tasks without manual input.
- **Download Tasks**: Admin can download the list of tasks with relevant details for reporting or monitoring purposes.
- **Search for Tasks**: Tasks can be searched by name, assignee, or other filters to quickly find and manage specific tasks.
- **Set Task Deadlines**: Admin can define deadlines for tasks, ensuring the team meets project timelines.

3. Activity Monitoring:
- **Track Changes in Tasks**: This feature logs any changes made to a task (like updates to the task name, status, priority, etc.), including who made the changes, when they were made, and what exactly was updated.
- **Audit Trail**: This creates a full history of task modifications, which is useful for accountability and tracking the progress of tasks over time.

4. Task Dashboard
- **Task Status Overview**: A visual representation showing the number of tasks based on their current status (e.g., how many tasks are "In Progress," "Completed," or "Not Started"). This helps in understanding workload distribution.
- **Priority Overview**: This view helps understand how many tasks are categorized as "High Priority," "Medium Priority," or "Low Priority."
- **Task Count by Users**: Displays the number of tasks assigned to each user, allowing admins to track workloads and manage resources effectively.

5. Reports:
The admin can generate comprehensive reports to track progress and productivity.

- **Log Time Report**:
  - Displays detailed logs of time entries for tasks, including both manual and automatic time logs.
  - The report allows filtering by user and task to get specific data.
  - Admin can download the log time report for further analysis.
  
- **Graphical Reports**:
  1. **Tasks Count by Priority**: Shows the distribution of tasks based on priority levels (High, Medium, Low).
  2. **Tasks Count by Status**: Provides a visual representation of the tasks categorized by their current status.
  3. **Tasks Count by User**: Displays how many tasks are assigned to each user, which helps in identifying workload imbalances.

- **Total Time Spent on Tasks**:
  - This report allows the admin to view the total time spent on each task within a selected date range, filtered by user or task.
  - Admin can also download the report for further use, which helps in understanding productivity and effort distribution across tasks and users.

**Additional Features**

1. Recurring Tasks:
- **Recurring Tasks**: Admins can set tasks to recur at regular intervals (e.g., daily, weekly, monthly). This is useful for tasks that need to be repeated regularly, such as maintenance tasks or routine check-ins.
- **Scheduled Jobs for Recurring Tasks**: Implemented automated scheduling for recurring tasks. Once set, the system automatically creates new tasks based on the recurrence pattern without manual intervention.
- **Overdue Task Notifications**: If a recurring task is overdue, the system sends an alert notification to the user responsible, ensuring no task is missed.

2. Email Notifications :
- **User Addition Notification**: Whenever a new user is added to the dashboard, they receive an email notification.
- **New Task Assignment Notification**: If any new task is assigned, they are notified via email.
- **Task Due Alerts**: If a task's deadline is approaching or overdue, the user will receive an email reminder to ensure timely completion.
- **OTP Login Notification**: Upon logging into the dashboard, users receive an OTP via email to complete the authentication process.

---

### **User Dashboard Features**

The User Dashboard is designed for individual users to track their assigned tasks and log their efforts.

- **View Assigned Tasks**: Users can see all the tasks assigned to them, along with details like task status, priority, and deadlines.
- **Log Time on Tasks**: Users can log their time manually or automatically based on the actual time they spend on tasks.
- **Monitor Task Progress**: Users can view their task progress, update statuses (if allowed), and make notes.
- **Receive Notifications**: Users get email notifications for task assignments, updates, and upcoming deadlines.

---

### **Conclusion**

This task management dashboard provides comprehensive tools for both admins and users to manage tasks effectively. It automates time logging, simplifies task creation and monitoring, and generates detailed reports for performance tracking. Features like recurring tasks, email notifications, and graphical dashboards ensure that tasks are completed on time and users stay informed. The use of OTP-based login enhances security, while scheduled jobs for recurring tasks streamline workflows.

This project is ideal for teams looking for a scalable and efficient way to manage tasks across different users and projects.
s