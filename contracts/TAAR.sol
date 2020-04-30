pragma solidity >=0.4.25;
pragma experimental ABIEncoderV2;


contract Patient {
    // Personal Details - Minimalistic details required for creating block

    string public name;
    string public identificationProof;
    string public addressProof;
    uint256 public age;
    uint256 public heightInCms;
    uint256 public weightInKgs;
    address public publicAddress;
    uint256 public noOfRecords = 0;
    uint256 public typeOfRec = 0;

    // Store structure of EHR as a mapping

    struct EHR {
        string fileLocation;
        uint256 byDoctorID;
        uint256 count;
        uint256[] permissionedDoctors;
        // uint256 permissionedDoctors;
    }

    mapping(uint256 => EHR) public healthRecords;

    // Functions in Patient

    constructor(
        string memory n,
        string memory idProof,
        string memory addrProof,
        uint256 a,
        uint256 h,
        uint256 w
    ) public {
        name = n;
        identificationProof = idProof;
        addressProof = addrProof;
        age = a;
        heightInCms = h;
        weightInKgs = w;
        publicAddress = address(this);
    }

    // Get Type

    function getType() public view returns (uint256) {
        return typeOfRec;
    }

    // Get location of file

    function getFileLocation(uint256 id)
        external
        view
        returns (string memory fileLoc)
    {
        return healthRecords[id].fileLocation;
    }

    // Check if doctor has the required permissions

    function checkForPermissions(uint256 id, uint256 doctorID)
        external
        view
        returns (bool ans)
    {
        for (
            uint256 i = 0;
            i < healthRecords[id].permissionedDoctors.length;
            i++
        ) {
            if (healthRecords[id].permissionedDoctors[i] == doctorID) {
                return true;
            }
        }
        return false;
    }

    function getRecordCount() public view returns (uint256) {
        return noOfRecords;
    }

    // Get no of records in that EHR

    function getEHRRecordCount(uint256 EHRId) public view returns (uint256) {
        return healthRecords[EHRId].count;
    }

    // Create a new health record

    function createNewRecord(uint256 doctorID, string memory fileLocation)
        public
    {
        healthRecords[noOfRecords].byDoctorID = doctorID;
        healthRecords[noOfRecords].count = 0;
        healthRecords[noOfRecords].permissionedDoctors.push(doctorID);
        healthRecords[noOfRecords++].fileLocation = fileLocation;
    }

    // Fetching minimalistic details of Patient

    function fetchDetailsOfPatient()
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            name,
            identificationProof,
            addressProof,
            age,
            heightInCms,
            weightInKgs
        );
    }

    // Fetching details of EHR given ID of EHR

    function fetchDetailsOfEHR(uint256 ID)
        public
        view
        returns (string memory, uint256, uint256)
    {
        return (
            healthRecords[ID].fileLocation,
            healthRecords[ID].byDoctorID,
            healthRecords[ID].count
        );
    }

    // Fetching doctor of EHR given ID of EHR

    function fetchPermissionedDoctorOfEHR(uint256 ID)
        public
        view
        returns (uint256[] memory, uint256)
    {
        uint256[] memory doctors = new uint256[](
            healthRecords[ID].permissionedDoctors.length
        );
        for (
            uint256 i = 0;
            i < healthRecords[ID].permissionedDoctors.length;
            i++
        ) {
            doctors[i] = healthRecords[ID].permissionedDoctors[i];
        }
        return (doctors, ID);
    }

    // Add new doctor in permission field

    function addDoctorToEHR(uint256 doctorID, uint256 EHRID) public {
        healthRecords[EHRID].permissionedDoctors.push(doctorID);
        healthRecords[EHRID].count++;
    }

    // Verification function

    function verifyDoctor() public view returns (uint256) {
        return now;
    }

    // Revoke Permissions of Doctor

    function revokePermissionOfDoctorOnEHR(uint256 EHRId, uint256 doctorID)
        public
        returns (bool)
    {
        // healthRecords[EHRId].permissionedDoctors[doctorID] = 0;

        for (
            uint256 i = 0;
            i < healthRecords[EHRId].permissionedDoctors.length;
            i++
        ) {
            if (healthRecords[EHRId].permissionedDoctors[i] == doctorID) {
                healthRecords[EHRId].permissionedDoctors[i] = 0;
                /* if (i < healthRecords[EHRId].permissionedDoctors.length - 1) {
                    healthRecords[EHRId]
                        .permissionedDoctors[i] = healthRecords[EHRId]
                        .permissionedDoctors[healthRecords[EHRId]
                        .permissionedDoctors
                        .length - 1];
                } else {
                    delete healthRecords[EHRId].permissionedDoctors[i];
                } */

                return true;
            }
        }

        return false;
    }
}


contract Consensus {
    uint256 typeOfRec = 2;

    struct instituteAddress {
        string name;
        bool active;
        address medicalInstituteAddress;
        uint256 lastModified;
    }

    // Get Type

    function getType() public view returns (uint256) {
        return typeOfRec;
    }

    // Get no of institutes

    function getNoOfInstitutes() public view returns (uint256) {
        return noOfAlloted;
    }

    // Keeps an array of all medical institutes and their last modified flag

    mapping(uint256 => instituteAddress) public publicAddresses;
    uint256 noOfAlloted = 0;

    // Methods

    // Registration of medical institute

    function registerMedicalInstitute(string memory name, address publicAddress)
        public
        returns (uint256 id)
    {
        uint256 num = noOfAlloted;
        publicAddresses[noOfAlloted].name = name;
        publicAddresses[noOfAlloted].medicalInstituteAddress = publicAddress;
        publicAddresses[noOfAlloted++].lastModified = now;
        return num;
    }

    // Changes last modified flag of Medical Institute

    function changeLastModified(uint256 time, uint256 id) public {
        publicAddresses[id].lastModified = time;
    }

    function getAllInstitutes(uint256 i)
        public
        view
        returns (instituteAddress memory)
    {
        return publicAddresses[i];
    }

    // Verification of OTP

    function verify(uint256 num1, uint256 num2) public pure returns (bool) {
        if (num1 == num2) {
            return true;
        }
        return false;
    }

    // Deactivate Institute

    function deactivateInstitute(uint256 id) public {
        publicAddresses[id].active = false;
    }
}


contract MedicalInstitute {
    Consensus consensusAddress;
    bool active = true;
    address conAddress;
    uint256 typeOfRec = 1;
    uint256 public myID;
    string public myName;
    uint256 noOfDocs = 1;

    struct Doctor {
        string name;
        bool active;
        string specialization;
    }

    mapping(uint256 => Doctor) public Doctors;

    // Get type

    function getType() public view returns (uint256) {
        return typeOfRec;
    }

    // Constructor to get ID of medical institute

    constructor(address cAddress, string memory n) public {
        conAddress = cAddress;
        consensusAddress = Consensus(cAddress);
        myName = n;
        myID = consensusAddress.registerMedicalInstitute(n, address(this));
    }

    // Register a doctor

    function registerDoctor(string memory n, string memory spec)
        public
        returns (uint256)
    {
        uint256 num = noOfDocs;
        Doctors[noOfDocs].name = n;
        Doctors[noOfDocs].active = true;
        Doctors[noOfDocs++].specialization = spec;
        return num;
    }

    // Get Details of Medical Institute
    function getDetails()
        public
        view
        returns (uint256, string memory, address)
    {
        return (myID, myName, conAddress);
    }

    function getNoOfDocs() public view returns (uint256) {
        return noOfDocs;
    }

    // Get details of a doctor

    function getDetailsOfDoctor(uint256 _ID)
        public
        view
        returns (string memory, string memory)
    {
        if (Doctors[_ID].active) {
            return (Doctors[_ID].name, Doctors[_ID].specialization);
        }
        return ("", "");
    }

    // Check if doctor is active

    function checkValidityOfDoctor(uint256 ID) public view returns (bool) {
        return Doctors[ID].active;
    }

    // Updating Consensus after some activity

    function updateLastModified() public {
        consensusAddress.changeLastModified(now, myID);
    }

    function addPermissions(
        address patientAddress,
        uint256 EHRId,
        uint256 doctorID
    ) public {
        Patient p = Patient(patientAddress);
        p.addDoctorToEHR(doctorID, EHRId);
    }

    function getFileLocation(uint256 EHRId, address patientAddress)
        public
        view
        returns (string memory)
    {
        Patient p = Patient(patientAddress);
        return p.getFileLocation(EHRId);
    }

    function requestForAccess() public view returns (bool) {
        uint256 OTP = now;
        bool res = consensusAddress.verify(OTP, OTP);
        return res;
    }

    // Revoke Doctor

    function revokeDoctor(uint256 docID) public {
        Doctors[docID].active = false;
    }

    // Revoke Medical Institute

    function revokeMedicalInst() public {
        active = false;
    }

    // Check if medical institute is active

    function isActive() public view returns (bool) {
        return active;
    }

    // Function to get ID of Doctor

    function getIDOfDoctor(string memory name) public view returns (uint256) {
        for (uint256 i = 0; i < noOfDocs; i++) {
            if (
                keccak256(abi.encodePacked((Doctors[i].name))) ==
                keccak256(abi.encodePacked((name)))
            ) {
                return i;
            }
        }
        return 0;
    }
}
