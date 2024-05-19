-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 19, 2024 at 01:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CID` int(11) NOT NULL,
  `First_Name` varchar(100) DEFAULT NULL,
  `Last_Name` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CID`, `First_Name`, `Last_Name`, `Email`, `phone`) VALUES
(1, 'Ahmed', 'Mohamed', 'Ahmed@gmail.com', '01015655141'),
(5, 'Hossam', 'Hassan', 'hossam@gmail.com', '156298787'),
(6, 'Sameh', 'Adam', 'Sameh@gmail.com', '0156498');

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `IID` int(11) NOT NULL,
  `Order_ID` int(11) NOT NULL,
  `Product_ID` int(11) DEFAULT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `Unit_Price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`IID`, `Order_ID`, `Product_ID`, `Quantity`, `Unit_Price`) VALUES
(1, 1, 1, 3, 10.50),
(2, 2, 1, 1, 10.50),
(3, 2, 2, 2, 15.00),
(4, 3, 1, 1, 10.50),
(5, 3, 2, 2, 15.00),
(6, 4, 1, 1, 10.50),
(7, 4, 2, 2, 15.00),
(8, 5, 1, 1, 10.50),
(9, 5, 2, 2, 15.00),
(10, 6, 1, 1, 10.50),
(11, 6, 2, 2, 15.00),
(12, 7, 3, 1, 35.00),
(13, 8, 2, 1, 15.00),
(14, 8, 4, 1, 40.00),
(15, 9, 2, 1, 15.00),
(16, 9, 4, 1, 40.00),
(17, 10, 2, 1, 15.00),
(18, 10, 4, 1, 40.00),
(19, 11, 2, 1, 15.00),
(20, 11, 4, 1, 40.00),
(21, 12, 2, 1, 15.00),
(22, 12, 4, 1, 40.00),
(23, 13, 2, 1, 15.00),
(24, 13, 4, 1, 40.00),
(25, 14, 2, 1, 15.00),
(26, 14, 4, 1, 40.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `OID` int(11) NOT NULL,
  `Customer_ID` int(11) DEFAULT NULL,
  `Order_Date` date DEFAULT current_timestamp(),
  `Total_Amount` decimal(9,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`OID`, `Customer_ID`, `Order_Date`, `Total_Amount`) VALUES
(1, 1, '2024-05-19', 31.50),
(2, 1, '2024-05-19', 36.00),
(3, 1, '2024-05-19', 36.00),
(4, 1, '2024-05-19', 36.00),
(5, 1, '2024-05-19', 36.00),
(6, 1, '2024-05-19', 36.00),
(7, 5, '2024-05-19', 35.00),
(8, 5, '2024-05-19', 55.00),
(9, 5, '2024-05-19', 55.00),
(10, 5, '2024-05-19', 55.00),
(11, 5, '2024-05-19', 55.00),
(12, 6, '2024-05-19', 55.00),
(13, 6, '2024-05-19', 55.00),
(14, 1, '2024-05-19', 55.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `PID` int(11) NOT NULL,
  `Product_Name` varchar(255) DEFAULT NULL,
  `Category` varchar(255) DEFAULT NULL,
  `Unit_Price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`PID`, `Product_Name`, `Category`, `Unit_Price`) VALUES
(1, 'Suntop', 'juice', 10.50),
(2, 'V7', 'Soft Drinks', 15.00),
(3, 'Dina Farms', 'Milk', 35.00),
(4, 'Juhayna full fat', 'Milk', 40.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CID`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`IID`),
  ADD KEY `product_id` (`Product_ID`),
  ADD KEY `Order_ID` (`Order_ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OID`),
  ADD KEY `orders_ibfk_1` (`Customer_ID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`PID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `CID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `IID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `OID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `PID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `orders` (`OID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`Customer_ID`) REFERENCES `customer` (`CID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
