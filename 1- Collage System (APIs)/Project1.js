let fs = require("fs");
let http = require("http");

//This function reads the file if it exists or creates it if it does not exist.
function createOrRead(fileName) {
  try {
    return JSON.parse(fs.readFileSync(fileName));
  }
  catch (error) {
    fs.writeFileSync(fileName, "[]");
    return [];
  }
}


//Reading files (convert json to object)
let students = createOrRead("Students.json");
let courses = createOrRead("Courses.json");
let departments = createOrRead("Departments.json");

//Function for looping over all existing emails to check the uniqueness of a given email and index if not unique.
function uniqueEmail(studentsFile, email) {
  for (let i = 0; i < studentsFile.length; i++) {
    if (studentsFile[i].Email == email) {
      return [false, i];
    }
  }
  return [true, -1];
}

//Function for looping over all existing departments to check validity of given department id.
function validDepartmentID(departmentsFile, departmentID) {
  for (let i = 0; i < departmentsFile.length; i++) {
    if (departmentsFile[i].ID == departmentID) {
      return true;
    }
  }
  return false;
}



http.createServer((req, res) => {
  const { url, method } = req;

  //STUNDENT APIs
  /* 1- Add student(email must be unique) */
  if (url == "/students/add" && method == "POST") {
    req.on("data", (chunk) => {
      let newStudent = JSON.parse(chunk);
      //Check if the department ID is valid
      if (validDepartmentID(departments, newStudent.Department_ID)) {
        //Check if the email is unique or not
        if (uniqueEmail(students, newStudent.Email)[0]) {
          // if the file is empty students IDs will start from 1001, if not then it will count one on the last added ID
          try {
            newStudent.ID = students[students.length - 1].ID + 1;
          }
          catch (error) {
            newStudent.ID = 1001;
          }

          students.push(newStudent);
          //updating file content
          fs.writeFileSync("Students.json", JSON.stringify(students));
          res.end("Student added successfully.");
        } else {
          res.end("This email address has been used before!");
        }
      } else {
        res.end("Invalid department ID !");
      }
    });
  }

  /* 2- GetAll students */
  else if (url == "/students" && method == "GET") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(students));
  }

  /* 3- Get all students with their department and courses */
  else if (url == "/students/details" && method == "GET") {
    res.setHeader("content-type", "application/json");
    //Deep cloning student and course files, to not affect the original files.
    let studentsCopy = JSON.parse(JSON.stringify(students));
    let coursesCopy = JSON.parse(JSON.stringify(courses));

    for (let i = 0; i < studentsCopy.length; i++) {
      studentsCopy[i].Courses = [];
      //find index of depatment for each student and replace the Department ID with its full data
      depIndex = departments.findIndex((x) => {
        return x.ID === studentsCopy[i].Department_ID;
      });
      delete studentsCopy[i].Department_ID;
      studentsCopy[i].Department = departments[depIndex];

      for (let j = 0; j < coursesCopy.length; j++) {
        if (studentsCopy[i].Department_ID == coursesCopy.Department_ID) {
          delete coursesCopy[j].Department_ID;
          studentsCopy[i].Courses.push(coursesCopy[j]);
        }
      }
    }

    res.end(JSON.stringify(studentsCopy));
  }

  /* 4- delete student
  The URL on the client side will be like this:
  localhost:5000/students/delete/1002
  1002 will be split, and after finding the index, the student will be deleted.*/
  else if (url.startsWith("/students/delete/") && method == "DELETE") {
    let targetID = Number(url.split("/")[3]);
    let targetIndex = students.findIndex((i) => {
      return i.ID === targetID;
    });

    if (targetIndex == -1) {
      return res.end("ID not exist !");
    } else {
      students.splice(targetIndex, 1);
      fs.writeFileSync("Students.json", JSON.stringify(students));
      res.end("Student deleted successfully.");
    }
  }
  /*5- update student
  The URL on the client side will be like this:
  localhost:5000/students/update/1002
  1002 will be splitted, and after finding the index, the student will be updated. */
  else if (url.startsWith("/students/update/") && method == "PUT") {
    let targetID = Number(url.split("/")[3]);
    req.on("data", (chunk) => {
      let newData = JSON.parse(chunk);
      //find index of student that will be updated, if not found it return -1.
      let targetIndex = students.findIndex((i) => {
        return i.ID === targetID;
      });
      if (targetIndex == -1) {
        return res.end("ID not exist !");
      } else {
        //Check if the email is unique and if it's the same email that the targeted student used before, then it's okay to use it again.
        if (uniqueEmail(students, newData.Email)[0] || uniqueEmail(students, newData.Email)[1] == targetIndex) {
          //Check if department id is valid
          if (validDepartmentID(departments, newData.Department_ID)) {
            students[targetIndex].Name = newData.Name;
            students[targetIndex].Email = newData.Email;
            students[targetIndex].Password = newData.Password;
            students[targetIndex].Department_ID = newData.Department_ID;
            fs.writeFileSync("Students.json", JSON.stringify(students));
            res.end("Updated successfully.");
          } else {
            res.end("Invalid department ID !");
          }
        } else {
          res.end("This email address used before!");
        }
      }
    });
  }
  /* 6- search for a student by ID
The URL on the client side will be like this:
localhost:5000/students/search/1001
1001 will be split, then and after finding the index, the data of the target will be returned as a response.
  */
  else if (url.startsWith("/students/search/") && method == "GET") {
    res.setHeader("content-type", "application/json");
    let targetID = Number(url.split("/")[3]);
    let targetIndex = students.findIndex((i) => {
      return i.ID === targetID;
    });
    if (targetIndex == -1) {
      res.end("Invalid ID !");
    } else {
      res.end(JSON.stringify(students[targetIndex]));
    }
  }

  /*---------------------------------------------------------------------------------------------------------*/
  //COURSES APIs
  /*1- Add courses*/
  else if (url == "/courses/add" && method == "POST") {
    req.on("data", (chunk) => {
      //convert json to object
      let newCourse = JSON.parse(chunk);
      //check if the department ID is valid
      if (validDepartmentID(departments, newCourse.Department_ID)) {
        try {
          newCourse.ID = courses[courses.length - 1].ID + 1;
        }
        catch (error) {
          newCourse.ID = 101;
        }
        courses.push(newCourse);
        fs.writeFileSync("Courses.json", JSON.stringify(courses));
        res.end("Added successfully.");
      } else {
        res.end("Invalid department ID !");
      }
    });
  }
  /*2- delete student
The URL on the client side will be like this:
localhost:5000/courses/delete/1002
1002 will be split, and after finding the index, the course will be deleted.*/
  else if (url.startsWith("/courses/delete/") && method == "DELETE") {

    let targetID = Number(url.split("/")[3]);
    let targetIndex = courses.findIndex((i) => {
      return i.ID === targetID;
    });

    if (targetIndex == -1) {
      return res.end("ID not exist !");
    } else {
      courses.splice(targetIndex, 1);
      fs.writeFileSync("Courses.json", JSON.stringify(courses));
      res.end("Course deleted successfully.");
    }
  }
  /*3- update course
The URL on the client side will be like this:
localhost:5000/courses/update/101
101 will be splitted, and after finding the index, the course will be updated. */
  else if (url.startsWith("/courses/update/") && method == "PUT") {
    let targetID = Number(url.split("/")[3]);
    req.on("data", (chunk) => {
      let newData = JSON.parse(chunk);
      //find index of the course that will be updated, if not found it return -1.
      let targetIndex = courses.findIndex((i) => {
        return i.ID === targetID;
      });
      if (targetIndex == -1) {
        return res.end("ID not exist !");
      } else {
        //Check if department id is valid
        if (validDepartmentID(departments, newData.Department_ID)) {
          courses[targetIndex].Name = newData.Name;
          courses[targetIndex].Content = newData.Content;
          courses[targetIndex].Department_ID = newData.Department_ID;
          fs.writeFileSync("Courses.json", JSON.stringify(courses));
          res.end("Updated successfully.");
        } else {
          res.end("Invalid department ID !");
        }
      }
    });
  }

  /*4- Get all courses*/
  else if (url == "/courses" && method == "GET") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(courses));
  }

  /* 5- Get specific course by Id
  The URL on the client side will be like this:
  localhost:5000/courses/search/101
  101 will be split, then and after finding the index, the data of the target will be returned as a response.*/
  else if (url.startsWith("/courses/search/") && method == "GET") {
    res.setHeader("content-type", "application/json");
    let targetID = Number(url.split("/")[3]);
    let targetIndex = courses.findIndex((i) => {
      return i.ID === targetID;
    });
    if (targetIndex == -1) {
      res.end("Invalid ID !");
    } else {
      res.end(JSON.stringify(courses[targetIndex]));
    }
  }

  /*---------------------------------------------------------------------------------------------------------*/
  //Department APIs
  /*1- Add Department*/
  else if (url == "/departments/add" && method == "POST") {
    req.on("data", (chunk) => {
      //convert json to object
      let newDep = JSON.parse(chunk);
      try {
        newDep.ID = departments[departments.length - 1].ID + 1;
      }
      catch (error) {
        newDep.ID = 1;
      }
      departments.push(newDep);
      fs.writeFileSync("Departments.json", JSON.stringify(departments));
      res.end("Added successfully.");
    });
  }
  /*2- update department
 The URL on the client side will be like this:
 localhost:5000/departments/update/5
 5 will be splitted, and after finding the index, the department will be updated. */
  else if (url.startsWith("/departments/update/") && method == "PUT") {
    let targetID = Number(url.split("/")[3]);
    req.on("data", (chunk) => {
      let newData = JSON.parse(chunk);
      //find index of the department that will be updated, if not found it return -1.
      let targetIndex = departments.findIndex((i) => {
        return i.ID === targetID;
      });
      if (targetIndex == -1) {
        return res.end("ID not exist !");
      } else {
        //Check if department id is valid
        departments[targetIndex].Name = newData.Name;
        fs.writeFileSync("Departments.json", JSON.stringify(departments));
        res.end("Updated successfully.");
      }
    });
  }

  /*3- delete department
    The URL on the client side will be like this:
    localhost:5000/departments/delete/5
    5 will be split, and after finding the index, the department will be deleted.*/
  else if (url.startsWith("/departments/delete/") && method == "DELETE") {
    let targetID = Number(url.split("/")[3]);
    let targetIndex = departments.findIndex((i) => {
      return i.ID === targetID;
    });

    if (targetIndex == -1) {
      return res.end("ID not exist !");
    } else {
      departments.splice(targetIndex, 1);
      fs.writeFileSync("Departments.json", JSON.stringify(departments));
      res.end("department deleted successfully.");
    }
  } else if (url == "/departments" && method == "GET") {
    /*4- Get all departments*/
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(departments));
  }

  /*5- Get specific department by Id
The URL on the client side will be like this:
localhost:5000/departments/search/101
101 will be split, then and after finding the index, the data of the target will be returned as a response. */
  else if (url.startsWith("/departments/search/") && method == "GET") {
    res.setHeader("content-type", "application/json");
    let targetID = Number(url.split("/")[3]);
    let targetIndex = departments.findIndex((i) => {
      return i.ID === targetID;
    });
    if (targetIndex == -1) {
      res.end("Invalid ID !");
    } else {
      res.end(JSON.stringify(departments[targetIndex]));
    }
  }
})
  .listen(5000, () => {
    console.log("Server is running ");
  });
