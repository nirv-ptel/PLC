const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

const ModbusRTU = require('modbus-serial');
const modbusClient = new ModbusRTU();
app.use(cors());


app.get('/api/data', async (req, res) => {
    try {
        await modbusClient.connectTCP("192.168.1.15", { port: 502 });

        const readData = async (start, length, convertFunction) => {
            const result = await modbusClient.readHoldingRegisters(start, length);
            return convertFunction ? convertFunction(result.data) : result.data;
        };

        const readData1 = async (start, length) => {
            const result = await modbusClient.readHoldingRegisters(start, length);
            return result.data[0];
        };

        const inputs0 = await readData(0, 7);
        const inputs1 = await readData(0, 2, convertToFloat);
        const inputs2 = await readData(2, 2, convertToFloat);
        const inputs3 = await readData1(4, 1);
        const inputs4 = await readData(5, 2, convertToInt32);

        res.json({ success: true, message: 'GET API response', data: { inputs0, inputs1, inputs2, inputs3, inputs4 } });
    } catch (error) {
        console.error(error.toString());
        res.status(500).json({ success: false, message: 'Internal server error', error: error.toString() });
    } finally {
        modbusClient.close();
    }
});

function convertToFloat(data) {
    return registersToFloat(data[0], data[1]);
}

function convertToInt32(data) {
    return registersToInt32(data[0], data[1]);
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

function registersToInt32(register1, register2) {
    return (register2 << 16) | register1;
}

function int32ToRegisters(value) {
    return [value & 0xFFFF, (value >> 16) & 0xFFFF];
}

app.use(express.json());

app.post('/api/data', async (req, res) => {
    try {
        await modbusClient.connectTCP("192.168.1.15", { port: 502 });
        
        const requestBody =  req.body;
        console.log(requestBody);

        const write = floatToRegisters(requestBody.input1);
        await modbusClient.writeRegisters(0, write);
        const write1 = floatToRegisters(requestBody.input2);
        await modbusClient.writeRegisters(2, write1);
        await modbusClient.writeRegisters(4, [requestBody.input3]);

        const write3 = int32ToRegisters(requestBody.input4);
        await modbusClient.writeRegisters(5, write3);

        res.json({ success: true, message: 'POST API response' });
    } catch (error) {
        console.error(error.toString());
        res.status(500).json({ success: false, message: 'Internal server error', error: error.toString() });
    } finally {
        modbusClient.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
