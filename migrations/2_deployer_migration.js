var consensus = artifacts.require("Consensus");
var MedicalInstitute = artifacts.require("MedicalInstitute");
var Patient = artifacts.require("Patient");

module.exports = function(deployer, network, accounts) {
    deployer.then(async() => {
        await deployer.deploy(consensus);
        await deployer.deploy(MedicalInstitute, consensus.address, "Hospital 1");
        await deployer.deploy(Patient, "A", "A", "A", 20,20,20, "8055654418", "arya.bhivpathaki@gmail.com");
    })
    
}     