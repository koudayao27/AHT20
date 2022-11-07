/**
 * AHT20 Custom Block
 */
namespace AHT20 {
    function Read(aht20: AHT20.AHT20Sensor): { Humidity: number, Temperature: number } {
        if (!aht20.GetState().Calibrated) {
            aht20.Initialization();
            if (!aht20.GetState().Calibrated) return null;
        }

        aht20.TriggerMeasurement();
        for (let i = 0; ; ++i) {
            if (!aht20.GetState().Busy) break;
            if (i >= 500) return null;
            basic.pause(10);
        }

        return aht20.Read();
    }

    /**
     * Read the temperature(°C)
     */
    //% block="Read the temperature(°C))"
    //% weight=3
    export function aht20ReadTemperatureC(): number {
        const aht20 = new AHT20.AHT20Sensor();
        const val = Read(aht20);
        if (val == null) return null;

        return val.Temperature;
    }

    /**
     * Read the temperature(°F)
     */
    //% block="Read the temperature(°F))"
    //% weight=2
    export function aht20ReadTemperatureF(): number {
        const aht20 = new AHT20.AHT20Sensor();
        const val = Read(aht20);
        if (val == null) return null;

        return val.Temperature * 9 / 5 + 32;
    }

    /**
     * Read the humidity
     */
    //% block="Read the humidity"
    //% weight=1
    export function aht20ReadHumidity(): number {
        const aht20 = new AHT20.AHT20Sensor();
        const val = Read(aht20);
        if (val == null) return null;

        return val.Humidity;
    }

    /**
     * Read the absolute humidity
     */
    //% block="Read the absolute humidity (g/m³) || as fixed-point 8.8bit %fp88"
    //% weight=0
    export function readAbsHumidity(fp88?: boolean): number {
        const aht20 = new AHT20.AHT20Sensor();
        const val = Read(aht20);
        if (val == null) return null;
        const T = val.Temperature;
        const rh = val.Humidity;
        const ret = 6.112 * Math.exp((17.67 * T) / (T + 243.5)) * rh * 2.1674 / (273.15 + T);
        if (!fp88) {
            return ret;
        }
        const byte0 = Math.floor(ret);
        const byte1 = Math.floor(256 * (ret - byte0));
        return byte0 << 8 | byte1 & 0xffff;
    }
}
