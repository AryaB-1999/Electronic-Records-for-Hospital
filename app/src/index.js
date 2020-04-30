import Web3 from 'web3'
import Consensus from '../../build/contracts/Consensus.json'
import MedicalInstitute from '../../build/contracts/MedicalInstitute.json'
import Patient from '../../build/contracts/Patient.json'
import ipfs from 'ipfs-http-client'
import contract from "truffle-contract"
import sendgrid from '@sendgrid/mail'
import cors from 'cors'

var initF = false;
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const App = {
  ipfshash: null,
  web3: null,
  account: null,
  con: null,
  medi: null,
  pat: null,
  loginAddress: null,
  doc: null,
  otp: null,

  start: async function () {
    if (!initF) {
      this.init()
      initF = true;
    }
  },

  init: async function () {
    const { web3 } = this
    try {

      // get contract instance
      const networkId = await web3.eth.net.getId()
      const consensusAddress = Consensus.networks[networkId]
      const medicalInstituteAddress = MedicalInstitute.networks[networkId]
      const patientAddress = Patient.networks[networkId]
      this.con = new web3.eth.Contract(Consensus.abi, consensusAddress.address)
      this.medi = new web3.eth.Contract(
        MedicalInstitute.abi,
        medicalInstituteAddress.address,
      )
      this.pat = new web3.eth.Contract(Patient.abi, patientAddress.address)

      console.log('Network ID : ' + networkId)
      console.log('Consensus : ' + consensusAddress.address)
      console.log('Medical Institute : ' + medicalInstituteAddress.address)
      console.log('Patient : ' + patientAddress.address)

      console.log(this.con.methods)
      console.log(this.medi.methods)
      console.log(this.pat.methods)

      // get accounts
      const accounts = await web3.eth.getAccounts()
      this.account = accounts[0]

      console.log(await this.pat.methods.fetchDetailsOfPatient().call())
    } catch (error) {
      console.error(error)
    }
  },

  // sendIPFS: async function () {
  //   try {
  //     console.log("HI")
  //     // const a = <div></div>
  //     // const ipfsInstance = ipfs('http://localhost:5001')
  //     // const id = ipfsInstance.id();
  //     // console.log("IPFS ID : " + id)
  //     // console.log(await ipfsInstance.version())

  //     // console.log(document.getElementById("image").files[0]);
  //     // const file = new File([document.getElementById("image").files[0]],{type: 'pdf'});
  //     // var fr = new FileReader();

  //     // console.log(file)

  //     // for await (const result of ipfsInstance.add(new Blob([file], {type: 'pdf'}))) {
  //     // console.log(result.path)
  //     // }
  //   }
  //   catch (err) {
  //     console.log(err);
  //   }
  // },

  loginPatient: async function () {
    try {
      const { web3 } = this
      const addrVal = document.getElementById("address").value
      this.loginAddress = addrVal;
      console.log(addrVal)
      this.pat = new web3.eth.Contract(Patient.abi, this.loginAddress)
      const result = await this.pat.methods.fetchDetailsOfPatient().call()

      document.getElementById("home").replaceWith(document.getElementById("patientLogin"))
      document.getElementById("patientLogin").hidden = false;
      document.getElementById("Pname").innerHTML = result[0]
      document.getElementById("PId").innerHTML = result[1]
      document.getElementById("PAddr").innerHTML = result[2]
      document.getElementById("PA").innerHTML = result[3]
      document.getElementById("PW").innerHTML = result[4]
      document.getElementById("PH").innerHTML = result[5]
      document.getElementById("PConAddr").innerHTML = this.loginAddress
      document.getElementById("patName").innerHTML += result[0]
      document.getElementById("PMob").innerHTML = result[6]
      document.getElementById("PMail").innerHTML = result[7]
    }
    catch (err) {
      alert("Login Address Incorrect!!")
      console.log(err)
    }
  },

  loginAdmin: async function () {
    try {
      const { web3 } = this
      const addrVal = document.getElementById("address").value
      this.loginAddress = addrVal
      this.con = new web3.eth.Contract(Consensus.abi, this.loginAddress)
      console.log(addrVal)
      console.log(await this.con.methods.getType().call())
      if (await this.con.methods.getType().call() != 2) {
        throw new Error()
      }
      document.getElementById("home").replaceWith(document.getElementById("adminLogin"))
      document.getElementById("adminLogin").hidden = false
      document.getElementById("adminAddress").innerHTML = this.loginAddress
    } catch (error) {
      alert("Login Address Incorrect!!")
      console.log(error)

    }
  },

  loginMedicalInstitute: async function () {
    try {
      const { web3 } = this
      const addrVal = document.getElementById("address").value
      this.loginAddress = addrVal
      this.medi = new web3.eth.Contract(MedicalInstitute.abi, this.loginAddress)
      console.log(addrVal)
      console.log(await this.medi.methods.getDetails().call())
      if (await this.medi.methods.isActive().call()) {
        const result = await this.medi.methods.getDetails().call()
        console.log("Changed ID");
        document.getElementById("home").replaceWith(document.getElementById("medicalInstituteLogin"))
        document.getElementById("medicalInstituteLogin").hidden = false;
        document.getElementById("Mresult0").innerHTML = result[0]
        document.getElementById("Mresult1").innerHTML = result[1]
        document.getElementById("Mresult2").innerHTML = result[2]
        document.getElementById("MaddressVal").innerHTML = this.loginAddress
        document.getElementById("medName").innerHTML += result[1]
      } else {
        alert("Institute has been blocked by Admin")
      }
    } catch (error) {
      console.error('Medical Institute connection problem' + error)
    }
  },

  loginDoctor: async function () {
    const doctID = parseInt(document.getElementById("loginID").value)
    if (isNaN(doctID)) {
      alert("Doctor ID not provided")
      return;
    }
    else {
      const { web3 } = this
      const addrVal = document.getElementById("address").value
      this.loginAddress = addrVal
      this.medi = new web3.eth.Contract(MedicalInstitute.abi, this.loginAddress)
      const result = await this.medi.methods.getDetailsOfDoctor(doctID).call()
      if (result[0] == "") {
        console.log("IN")
        alert("Incorrect Doctor ID for Medical Institute")
        return;
      }
      else if (!this.medi.methods.isActive().call()) {
        alert("Medical Institute has been blocked by Admin")
        return;
      }
      else {
        this.doc = doctID
        const a = await this.medi.methods.checkValidityOfDoctor(this.doc).call()
        if (!a) {
          alert("You have been blocked by Medical Institute")
          return;
        }
        else {
          document.getElementById("doctorLogin").hidden = false;
          document.getElementById("home").hidden = true;
          const hdoc = document.getElementById("HDocName")
          const docName = document.getElementById("docName")
          const docMedIns = document.getElementById("docMedIns")
          const docID = document.getElementById("docID")
          const docSpec = document.getElementById("docSpec")
          docID.innerHTML = doctID;
          hdoc.innerHTML = result[0]
          docName.innerHTML = result[0]
          docMedIns.innerHTML = this.loginAddress
          docSpec.innerHTML = result[1]
        }
      }
    }
  },

  registerMedWithDet: async function () {
    const { web3 } = this
    console.log("Account : " + this.account)
    document.getElementById("registerMed").style.display = 'none'
    const name = document.getElementById("regMedName").value
    console.log(name)
    let med = contract(MedicalInstitute)
    console.log("Med : " + med)
    const networkId = await web3.eth.net.getId()
    med.setProvider(web3.currentProvider)
    med.setNetwork(networkId)
    const instance = await med.new(this.loginAddress, name, { from: this.account, })
    alert(name + " has been deployed at address : " + instance.address)
  },

  registerDoc: async function () {
    try {
      document.getElementById("registerDoc").style.display = 'none'
      // const myAddress = document.getElementById("address").value
      const docName = document.getElementById("regDocName").value
      const docSpec = document.getElementById("regDocSpec").value
      console.log(docName)
      console.log(docSpec)
      const medInst = new this.web3.eth.Contract(MedicalInstitute.abi, this.loginAddress)
      const retdocID = await medInst.methods.registerDoctor(docName, docSpec).send({ from: this.account, gas: 6721975 })
      console.log(retdocID)
      const detOfDoc = await medInst.methods.getIDOfDoctor(docName).call();
      console.log(detOfDoc)
      alert(docName + " has been given ID : " + detOfDoc)
    }
    catch (err) {
      console.log(err)
      alert("error occured while processing")
    }
  },

  registerPat: async function () {
    try {
      const { web3 } = this
      console.log(this.account)
      document.getElementById("registerPat").style.display = 'none'
      const patName = document.getElementById("regPatName").value
      const patID = document.getElementById("regPatID").value
      const patAddr = document.getElementById("regPatAddr").value
      const patAge = parseInt(document.getElementById("regPatA").value)
      const patHeight = parseInt(document.getElementById("regPatH").value)
      const patWeight = parseInt(document.getElementById("regPatW").value)
      const mob = document.getElementById("regPatMob").value;
      const mail = document.getElementById("regPatMail").value;
      const patient = contract(Patient)
      const netID = await web3.eth.net.getId()
      patient.setProvider(this.web3.currentProvider)
      patient.setNetwork(netID)
      const patientInstance = await patient.new(patName, patID, patAddr, patAge, patHeight, patWeight, mob, mail, { from: this.account })
      alert(patName + " has been registered, address of patient is : " + patientInstance.address)
      console.log(patientInstance.address)
    }
    catch (err) {
      console.log(err)
      alert("Problem in registering patient")
    }
  },

  fillMedDocs: async function () {
    console.log("FILL MED DOCS CALLED")
    const { web3 } = this
    this.medi = new web3.eth.Contract(MedicalInstitute.abi, this.loginAddress)
    const res = await this.medi.methods.getNoOfDocs().call();
    let docTable = document.getElementById("medDocInfo")
    docTable.innerHTML = "<tr><td>ID#</td><td>Name</td><td>Specialization</td><td></td></tr>"
    let buf, flag;
    for (var i = 1; i < res; i++) {
      buf = await this.medi.methods.getDetailsOfDoctor(i).call()
      flag = await this.medi.methods.checkValidityOfDoctor(i).call()
      if (flag)
        docTable.innerHTML += "<tr><td>" + i + "</td>" + "<td>" + buf[0] + "</td>" + "<td>" + buf[1] + "</td><td><button class='w3-button w3-light-grey' onclick='App.deactivateDoc(" + i + ")'>Delete</button></td><tr>"
    }
    console.log(res);
  },

  createEHR: async function () {
    const { web3 } = this
    document.getElementById('createEHR').style.display = 'none'
    const patAddress = document.getElementById('crEHRPatAddr').value
    const ipfsInstance = ipfs('http://localhost:5001')
    const id = ipfsInstance.id();
    const file = new Blob([document.getElementById("crEHRFile").files[0]], { type: '*' });
    console.log("IPFS ID : " + id)
    console.log(await ipfsInstance.version())
    let fileHash
    for await (const result of ipfsInstance.add(new Blob([file], { type: '*' }))) {
      fileHash = result.path
      console.log(result.path)
    }
    const accounts = await web3.eth.getAccounts()
    console.log("Login address : " + this.loginAddress)
    const p = new this.web3.eth.Contract(Patient.abi, patAddress)
    console.log(p.methods)
    console.log(this.doc)
    try {
      const res = await p.methods.createNewRecord(this.doc, fileHash + "").send({ from: accounts[2], gas: 6721975 })
    } catch (err) {
      console.log("Its there" + err)
    }
    const ehrID = await p.methods.getRecordCount().call()
    console.log(ehrID)
    alert("EHR has been created, reference number of EHR is : " + (ehrID - 1))
  },

  fillPatRecs: async function () {
    const patRecs = document.getElementById('patRecsTable')
    const p = new this.web3.eth.Contract(Patient.abi, this.loginAddress)
    var i = await p.methods.getRecordCount().call()
    console.log("record Count : " + i)
    i--;
    let res;
    patRecs.innerHTML = "<tr><td>ID#</td><td>Hash Value</td><td>Created by Doctor</td><td></td></tr>"
    for (; i >= 0; i--) {
      res = await p.methods.fetchDetailsOfEHR(i).call()
      if (res[0] != "") {
        console.log("Perm : " + res[3])
        console.log("Result" + res)
        console.log("Resultant record : " + res[3])
        const manageButton = "<td><button id = IPFSManage" + i + " class='w3-button w3-light-grey' onclick='App.manageIPFSFile(" + i + ")'>Manage</button></td>"
        const deleteButton = "<td><button id = IPFSDel" + i + " class='w3-button w3-light-grey' onclick='App.deleteIPFSFile(" + i + ")'>Delete</button></td>"
        const fetchButton = "<td><button id = IPFSPat" + i + " class='w3-button w3-light-grey' onclick='App.fetchIPFSFile(" + i + ")'>Fetch</button></td>"
        patRecs.innerHTML += "<tr><td>" + i + "<td>" + res[0] + "</td><td>" + res[1] + "</td>" + fetchButton + manageButton + deleteButton + "</tr>"
      }
      else {

      }
    }
  },

  fetchIPFSFile: async function (arg) {
    const ipfsInstance = ipfs('http://localhost:5001')
    const id = ipfsInstance.id();
    console.log("IPFS ID : " + id)
    console.log(await ipfsInstance.version())
    const p = new this.web3.eth.Contract(Patient.abi, this.loginAddress)
    let res = await p.methods.fetchDetailsOfEHR(arg).call()
    if (res[0] == "") {
      alert("EHR is deleted or does not exist")
    }
    else {
      // const file = await ipfsInstance.get(res[0])
      // console.log(file)
      var file1;
      // for await (const file of ipfsInstance.get(res[0])) {
      //   console.log(file.path)

      //   const content = new BufferList()
      //   for await (const chunk of file.content) {
      //     content.append(chunk)
      //   }
      //   file1 += content.toString('base64')
      //   // console.log(content.toString())
      // }
      // // console.log(file1)
      // const file2 = new Blob([file1], {type:'pdf'})
      // console.log(file2)
      // FileSaver.saveAs(file2,"Sample.pdf")

      var url = "http://ipfs.io/ipfs/" + res[0]
      console.log(url)

      document.getElementById('iframeEHR').src = "http://localhost:8080/ipfs/" + res[0]
      document.getElementById('showEHR').style.display = 'block'
    }
  },

  requestEHR: async function () {
    document.getElementById('fetchEHR').style.display = 'none'
    const patAddress = document.getElementById('reqEHRAddr').value
    const EHRId = parseInt(document.getElementById('reqEHRID').value)
    console.log(EHRId)

    // Checking if doctor has required permissions
    const p = new this.web3.eth.Contract(Patient.abi, patAddress)
    const res = await p.methods.checkForPermissions(EHRId, this.doc).call()
    console.log(res)
    if (res) {
      let result = await p.methods.fetchDetailsOfEHR(EHRId).call()
      if (result[0] == "") {
        alert("EHR does not exist or is deleted")
        return;
      } else {
        var url = "http://ipfs.io/ipfs/" + result[0]
        console.log(url)

        document.getElementById('iframeEHR').src = "http://localhost:8080/ipfs/" + result[0]
        document.getElementById('showEHR').style.display = 'block'
      }
    }
    else {
      // var client = new twilio('AC156faa4751108703f162eece68f2953a', '584a07eb4434e9af6849addf24b819c8')
      const validateVar = await p.methods.verifyDoctor().call()
      const res = await p.methods.fetchDetailsOfPatient().call()
      const pMail = res[7]
      console.log(validateVar)
      this.otp = validateVar
      const message = {
        to: pMail,
        method: "POST",
        from: 'arya.bhivpathaki18@vit.edu',
        subject: 'OTP for verification',
        text: 'Your OTP for verification is : ' + this.otp
      };
      // sendgrid
      //   .send(message)
      //   .then(() => { }, error => {
      //     console.error(error);

      //     if (error.response) {
      //       console.error(error.response.body)
      //     }
      //   });
      // client.messages.create({
      //   to: '+918055654418',
      //   from: '+19382533225',
      //   body: 'You OTP verification number is : ' + validateVar
      // })
      document.getElementById('showValidate').style.display = 'block'
      console.log("BYE")
    }
  },
  verifyOTP: async function () {
    document.getElementById('showValidate').style.display = 'none'
    const givenOTP = document.getElementById('otp').value
    if (this.otp == givenOTP) {
      const patAddress = document.getElementById('reqEHRAddr').value
      const EHRId = parseInt(document.getElementById('reqEHRID').value)
      const p = new this.web3.eth.Contract(Patient.abi, patAddress)
      await p.methods.addDoctorToEHR(this.doc, EHRId).send({ from: this.account })
      this.requestEHR();
    } else {
      alert("OTP not valid")
    }
  },
  manageIPFSFile: async function (arg) {
    const p = new this.web3.eth.Contract(Patient.abi, this.loginAddress)
    let res = await p.methods.fetchPermissionedDoctorOfEHR(arg).call()
    let perm = res[0];
    console.log("Permissions : " + perm)
    const table = document.getElementById('managePermTable')

    if (perm == 0) {
      table.innerHTML = "<tr><td>This Record has no permissions to manage</td><td></td>";
    } else {
      table.innerHTML = "<tr><td>Doctor ID</td><td></td>";
      for (var i = 0; i < perm.length; i++) {
        if (perm[i] != 0) {
          table.innerHTML += "<tr><td>" + perm[i] + "</td><td><button id = rem" + i + " class='w3-button w3-light-grey' onclick='App.removePerm(" + arg + "," + perm[i] + ")'>Revoke</button></td><tr/>"
        }
      }
    }
    document.getElementById('managePerm').style.display = 'block'
  },
  removePerm: async function (EHRId, doctorID) {
    document.getElementById('managePerm').style.display = 'none'
    console.log("EHR ID : " + EHRId)
    console.log("DOCTOR ID : " + doctorID)
    const p = new this.web3.eth.Contract(Patient.abi, this.loginAddress)
    console.log(await p.methods.revokePermissionOfDoctorOnEHR(EHRId, doctorID).send({ from: this.account }))
    console.log("Changed Permissions")
    this.fillPatRecs()
  },
  adminInstPopulate: async function () {
    console.log("In that function")
    const instTable = document.getElementById('adminInstTable')
    instTable.innerHTML = "<tr><td>Institute Name</td><td>Institute Deployed Address</td><td>Last Modified Time</td><td></td></tr>"
    const c = new this.web3.eth.Contract(Consensus.abi, this.loginAddress)
    console.log(c)
    const noOfInst = await c.methods.getNoOfInstitutes().call()
    var date, res;
    for (var i = 0; i < noOfInst; i++) {
      res = await c.methods.getAllInstitutes(i).call()
      if (res[0]) {
        date = new Date((res[3] * 1000)).toString()
        console.log(date)
        instTable.innerHTML += "<tr><td>" + res[0] + "</td><td>" + res[2] + "</td><td>" + date + "</td><td><button class='w3-button w3-light-grey' onclick='App.deactivateMI(" + i + ")'>Delete</button></td></tr>"
      }
    }
    console.log(res)
  },
  updateLastModified: async function () {
    const { web3 } = this
    this.medi = new web3.eth.Contract(MedicalInstitute.abi, this.loginAddress)
    await this.medi.methods.updateLastModified().send({ from: this.account })
    alert("Done Updating...")
  },
  deactivateMI: async function (i) {
    var ret = confirm("Do you want to proceed with deleting?")
    if (ret) {
      const c = new this.web3.eth.Contract(Consensus.abi, this.loginAddress)
      const res = await c.methods.getAllInstitutes(i).call()
      const m = new this.web3.eth.Contract(MedicalInstitute.abi, res[2])
      await m.methods.revokeMedicalInst().send({ from: this.account })
      await c.methods.deactivateInstitute(i).send({ from: this.account })
      console.log("we are down")
    }
  },
  deactivateDoc: async function (i) {
    var conf = confirm("Proceed with deleting doctor?")
    if (conf) {
      await this.medi.methods.revokeDoctor(i).send({ from: this.account })
      this.fillMedDocs();
    }
  },
  deleteIPFSFile: async function (arg) {
    console.log("In delete")
    const p = new this.web3.eth.Contract(Patient.abi, this.loginAddress)
    let res = await p.methods.fetchPermissionedDoctorOfEHR(arg).call()
    var conf = confirm("Are you sure you want to delete this file, it cannot be recovered again?")
    if (conf) {
      await p.methods.removeEHR(arg).send({ from: this.account })
    }
    this.fillPatRecs();
  }
}

window.App = App

window.addEventListener('load', function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum)
    App.use(cors({ origin: "*" }))
    window.ethereum.enable() // get permission to access accounts
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live',
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider('http://127.0.0.1:7545'),
    )
  }

  App.start()
})
