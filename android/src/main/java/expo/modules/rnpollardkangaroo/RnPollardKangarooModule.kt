package expo.modules.rnpollardkangaroo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.aptos_pollard_kangaroo_mobile.WasmKangaroo
import uniffi.aptos_pollard_kangaroo_mobile.createKangaroo

class RnPollardKangarooModule : Module() {
    private var instances: Array<WasmKangaroo> = arrayOf()

    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('RnPollardKangaroo')` in JavaScript.
        Name("RnPollardKangaroo")

        // Initialize Kangaroo Singleton
        AsyncFunction("initializeKangaroo") { secretSize: IntArray ->
            try {
                instances = Array(secretSize.size) { createKangaroo(secretSize[it].toUByte()) }
                true
            } catch (e: Exception) {
                throw Exception("Error initializing Kangaroo: ${e.localizedMessage}")
            }
        }

        // Solve DLP Function
        AsyncFunction("solveDlp") { pkBytes: ByteArray, timeLimits: LongArray ->
            try {
                for (i in instances.indices) {
                    val result = instances[i].solveDlp(pkBytes, timeLimits[i].toULong())
                    if (result != null) {
                        return@AsyncFunction result.toLong()
                    }
                }

                throw Exception("Error solving DLP: No solution found")
            } catch (e: Exception) {
                throw Exception("Error solving DLP: ${e.localizedMessage}")
            }
        }
    }
}
