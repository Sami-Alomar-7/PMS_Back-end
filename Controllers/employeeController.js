// Models 
const Employee = require('../Models/AuthModels/Employee');
const EmployeeRole = require('../Models/AuthModels/EmployeeRole');
const Role = require('../Models/AuthModels/Role');

// using the .env file
require('dotenv').config();

// for the requests which failes not to fill the storage with unwanted files
const deleteAfterMulter = require('../Helper/deleteAfterMulter');

// for cheking if there were any errors in the rqueset body
const { validationResult } = require('express-validator');

// for hashing and creating tokens
const bcrypt = require('bcryptjs');

exports.getAllEmployees = (req, res, next) => {
    Employee.findAll({limit: 6})
    .then(employees => {
        if(!employees)
            return res.status(404).json({
                operation: 'Failed',
                message: 'Could Not Find The Employee'
            })
        return res.status(200).json({
            operation: 'Succeed',
            employees: employees
        })
    })
    .catch(err => {
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.getEmployeeProfile = (req, res, next) => {
    const employeeId = req.employeeId;

    Employee.findOne({
        where: { id: employeeId },
        include: Role
    })
    .then(employee => {
        if(!employee)
            return res.status(404).json({
                operation: 'Failed',
                message: 'Could Not Find The Employee'
            })
            
        return res.status(200).json({
            operation: 'Succeed',
            employee: employee
        })
    })
    .catch(err => {
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    })
};

exports.postAddEmployee = (req, res, next) =>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const gender = req.body.gender;
    const salary = req.body.salary;
    const role = req.body.role;
    const image = req.file;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty()){
        deleteAfterMulter(image.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()
        });
    }
    
    // hash the password and store the new record
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const employee = new Employee({
                name: name,
                email: email,
                password: hashedPassword,
                address: address,
                gender: gender,
                phone_number: phone_number
            });
            return employee.save()
                .then(employee => {
                    const employeeRole = new EmployeeRole({
                        employeeId: employee.id,
                        roleId: role,
                        salary: salary
                    });
                    return employeeRole.save();
                })
                .then(employeeRole => {
                    return res.status(200).json({
                        message: 'Succeed',
                        employee: employee,
                        employeeRole: employeeRole
                    });
                })
        })
        .catch(err => {
            deleteAfterMulter(image.path);
            return res.status(400).json({
                message: err
            });
        })
};

exports.putUpdateProfile = (req, res, next) => {
    const updteEmployeeId = req.body.updateEmployeeId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const updatedPhone_number = req.body.phone_number;
    const updatedAddress = req.body.address;
    const updatedSalary = req.body.salary;
    const updatedEmployeeOfTheMonth = req.body.employeeOfTheMonth;
    const updatedRole = req.body.role;
    const updateImage = req.file;
    const errors = validationResult(req);

    // check if there is an error in the request
    if(!errors.isEmpty()){
        deleteAfterMulter(updateImage.path);
        return res.status(401).json({
            operation: 'Failed',
            message: errors.array()
        });
    }
        
    // get the employee and update his data
    Employee.findOne({
        where: { id: updteEmployeeId },
        include: Role
    })
    .then(employee => {
        
        if(!employee){
            deleteAfterMulter(updateImage.path);
            return res.status(404).json({
                operation: 'Failed',
                message: 'Employee Not Found'
            });
        }
            
        employee.name = updatedName;
        employee.email = updatedEmail;
        employee.password = updatedPassword;
        employee.phone_number = updatedPhone_number;
        employee.address = updatedAddress;
        employee.roles[0].employee_role.employee_of_the_month = updatedEmployeeOfTheMonth;
        employee.roles[0].employee_role.salary = updatedSalary;
        employee.roles[0].employee_role.roleId = updatedRole;
        
        return employee.save();
    })
    .then(updatedEmployee => {
        return res.status(200).json({
            operation: 'Succeed',
            updatedEmployee: updatedEmployee
        })
    })
    .catch(err => {
        deleteAfterMulter(updateImage.path);
        return res.status(400).json({
            operation: 'Failed',
            message: err
        })
    });
};

exports.deleteEmployee = (req, res, next) => {
    const employeeId = req.body.employeeId;

    Employee.destroy({where: {id: employeeId}})
        .then(deletedEmployee => {
            if(!deletedEmployee)
                return res.status(404).json({
                    operation: 'Failed',
                    message: 'Employee Not Found'
                });
            return res.status(200).json({
                operation: 'Succeed',
                employee: deletedEmployee
            });
        })
        .catch(err => {
            return res.status(400).json({
                operation: 'Failed',
                message: err
            });
        });
};