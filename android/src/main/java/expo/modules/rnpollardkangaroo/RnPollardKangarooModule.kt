package expo.modules.rnpollardkangaroo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.util.Base64
import uniffi.aptos_pollard_kangaroo_mobile.WasmKangaroo
import uniffi.aptos_pollard_kangaroo_mobile.createKangaroo
import java.math.BigInteger

class KangarooInstance private constructor(
    tableObject: String,
    n: ULong,
    w: ULong,
    r: ULong,
    bits: UByte
) {
    // Singleton instance
    companion object {
        @Volatile
        private var instance: KangarooInstance? = null

        // Initialize the singleton instance
        @Throws(Exception::class)
        fun initialize(
            tableObject: String,
            n: ULong,
            w: ULong,
            r: ULong,
            bits: UByte
        ) {
            if (instance == null) {
                synchronized(this) {
                    if (instance == null) {
                        instance = KangarooInstance(tableObject, n, w, r, bits)
                    } else {
                        throw IllegalStateException("KangarooInstance is already initialized!")
                    }
                }
            } else {
                throw IllegalStateException("KangarooInstance is already initialized!")
            }
        }

        // Get the initialized instance
        @Throws(Exception::class)
        fun getInstance(): KangarooInstance {
            return instance ?: throw IllegalStateException("KangarooInstance is not initialized!")
        }
    }

    // Kangaroo logic (uses the provided createKangaroo function)
    private var wasmKangaroo: WasmKangaroo = createKangaroo(tableObject, n, w, r, bits)

    // Method to set Kangaroo
    fun setWasmKangaroo(kangaroo: WasmKangaroo) {
        wasmKangaroo = kangaroo
    }

    // Method to get Kangaroo
    fun getWasmKangaroo(): WasmKangaroo {
        return wasmKangaroo
    }

    // Solve DLP using WasmKangaroo
    @Throws(Exception::class)
    fun solveDlp(pk: ByteArray): Long {
        return wasmKangaroo.solveDlp(pk).toLong()
    }
}

class RnPollardKangarooModule : Module() {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('RnPollardKangaroo')` in JavaScript.
        Name("RnPollardKangaroo")

      // Initialize Kangaroo Singleton
      AsyncFunction("initializeKangaroo") {
          tableObject: String,
          n: String, // Pass as String to handle large numbers safely from JS
          w: String,
          r: String,
          bits: Int // Bits as Int since JS doesn't support UByte
        ->
        try {
          // Convert parameters to appropriate types
          val nValue = n.toULong()
          val wValue = w.toULong()
          val rValue = r.toULong()
          val bitsValue = bits.toUByte()

          // Initialize singleton
          KangarooInstance.initialize(tableObject, nValue, wValue, rValue, bitsValue)
          true
        } catch (e: Exception) {
          throw Exception("Error initializing Kangaroo: ${e.localizedMessage}")
        }
      }

      // Solve DLP Function
      AsyncFunction("solveDlp") { pkString: String ->
        try {
          // Retrieve singleton instance
          val kangarooInstance = KangarooInstance.getInstance()

          // Convert BigInt string to ByteArray
          val pkData = bigIntStringToByteArray(pkString)
            ?: throw IllegalArgumentException("Invalid BigInt string!")

          // Solve DLP and return result
          kangarooInstance.solveDlp(pkData)
        } catch (e: Exception) {
          throw Exception("Error solving DLP: ${e.localizedMessage}")
        }
      }
    }
}

// Utility function to convert BigInt string to ByteArray
private fun bigIntStringToByteArray(value: String): ByteArray? {
  return try {
    val bigInt = BigInteger(value)
    val byteArray = bigInt.toByteArray()

    // Ensure the byte array doesn't contain leading zeroes
    if (byteArray[0] == 0.toByte()) byteArray.copyOfRange(1, byteArray.size) else byteArray
  } catch (e: Exception) {
    null
  }
}