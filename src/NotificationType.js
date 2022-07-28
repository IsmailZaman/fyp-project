module.exports = class NotificationType {

    enrolledInCourse(courseName) {
        return {
            title: "Enrollment Approved",
            text: `You have been enrolled in ${courseName}`,
            seen: false
        }
    }




}
