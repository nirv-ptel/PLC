// index.js

const express = require('express');
const app = express();
const port = 3000;


const ModbusRTU = require('modbus-serial');
const modbusClient = new ModbusRTU();

// try {
//     await modbusClient.connectTCP("192.168.1.15", { port: 502 });
// } catch (error) {
//     console.error(error.toString());
// } finally {
//     modbusClient.close();
// }
app.get('/', (req, res) => {
    const ModbusRTU = require('modbus-serial');

async function readModbusData() {
  const modbusClient = new ModbusRTU();
  
  try {
    await modbusClient.connectTCP("192.168.1.15", { port: 502 });
    // Read Int value from register 0 (Barrier Command)

    if(modbusClient.isOpen) {
        console.log('connected');
    }
    const intResult = await modbusClient.readHoldingRegisters(0,6);
    console.log(intResult.data);

    // const readFloatRegisters = await modbusClient.readHoldingRegisters(0, 2);
    // const readFloatValue = registersToFloat(readFloatRegisters.data[0], readFloatRegisters.data[1]);
    // console.log("Read Float Value:", readFloatValue);

    // const write = floatToRegisters(5.0);
    await modbusClient.writeRegisters(4, [2, 6, 0]);
   
    // const readFloatRegisters1 = await modbusClient.readHoldingRegisters(0, 2);
    // const readFloatValue1 = registersToFloat(readFloatRegisters1.data[0], readFloatRegisters1.data[1]);
    // console.log("Read Float Value:", readFloatValue1);
   
    // const intResult1 = await modbusClient.readHoldingRegisters(0, 6);
    // console.log(intResult1.data);

  } catch (error) {
    console.error(error.toString());
  } finally {
    modbusClient.close();
  }

}

    function registersToFloat(register1, register2) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt16LE(register1, 0);
        buffer.writeUInt16LE(register2, 2);
        return buffer.readFloatLE(0);
    }

    function floatToRegisters(floatValue) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(floatValue, 0);
        return [buffer.readUInt16LE(0), buffer.readUInt16LE(2)];
    }

    function int32ToRegisters(int32Value) {
        return [int32Value & 0xFFFF, int32Value >> 16];
    }
  
    function registersToInt32(register1, register2) {
        return (register2 << 16) | register1;
    }

 readModbusData();

  res.send("aa");

});

// GET API
app.get('/api/data', async (req, res) => {
    let inputs0 = [];
    let inputs= [];
    try {
        await modbusClient.connectTCP("192.168.1.15", { port: 502 });
       const intResult = await modbusClient.readHoldingRegisters(0,7);
       inputs0 = intResult.data;

    const readFloatRegisters = await modbusClient.readHoldingRegisters(0, 2);
    const readFloatValue = registersToFloat(readFloatRegisters.data[0], readFloatRegisters.data[1]);
    inputs.push(readFloatValue);

    const readFloatRegisters1 = await modbusClient.readHoldingRegisters(2, 2);
    const readFloatValue1 = registersToFloat(readFloatRegisters1.data[0], readFloatRegisters1.data[1]);
    inputs.push(readFloatValue1);
    
    const readFloatRegisters2 = await modbusClient.readHoldingRegisters(4, 1);
    inputs.push(readFloatRegisters2.data[0]);
    
    const readFloatRegisters3 = await modbusClient.readHoldingRegisters(5, 2);
    const readFloatValue3 = registersToInt32(readFloatRegisters3.data[0], readFloatRegisters3.data[1]);
    inputs.push(readFloatValue3);

    } catch (error) {
        console.error(error.toString());
    } finally {
        modbusClient.close();
    }

    res.json({ message: 'GET API response', data: inputs0, data1: inputs });
  });
  
  app.use(express.json());
  // POST API
  app.post('/api/data', async (req, res) => {
    const requestData = req.body;
console.warn(requestData.input1);
    // const write = floatToRegisters(requestData.input1);
    // await modbusClient.writeRegisters(0, write);

    // const write1 = floatToRegisters(requestData.input2);
    // await modbusClient.writeRegisters(2, write1);
    
    // await modbusClient.writeRegisters(4, requestData.input3);

    // const write2 = floatToRegisters(requestData.input4);
    // await modbusClient.int32ToRegisters(5, write2);

    res.json({ message: 'POST API response', requestData });
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
