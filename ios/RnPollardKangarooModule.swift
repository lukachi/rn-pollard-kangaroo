import ExpoModulesCore

public class RnPollardKangarooModule: Module {
    
    private var kangarooInstances: [WasmKangaroo] = []

  public func definition() -> ModuleDefinition {
    Name("RnPollardKangaroo")

      // Initialize the Kangaroo singleton
      AsyncFunction("initializeKangaroo") { (secretSizes: [UInt8]) in
          do {
              // Try createKangaroo each secretSize
            
              self.kangarooInstances = try secretSizes.map { try createKangaroo(secretSize: $0) }

              return true
          } catch {
              // Catch and throw the error
              throw NSError(domain: "RnPollardKangarooModuleError", code: 1, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          }
      }
      
      // Solve DLP using the initialized KangarooInstance
      AsyncFunction("solveDlp") { (pkData: Data, timeLimits: [UInt64]) -> UInt64 in
          do {
              // For each of kangarooInstances, call solveDlp with timeLimits, if result of execution is null, continue to the next execution with next time limit, if instance was the last, and no result was found - throw error
              
              for (index, kangarooInstance) in self.kangarooInstances.enumerated() {
                  if let result = try kangarooInstance.solveDlp(pk: pkData, maxTime: timeLimits[index]) {
                      return result
                  }
              }
              
              throw NSError(domain: "RnPollardKangarooModuleError", code: 2, userInfo: [NSLocalizedDescriptionKey: "No result found"])
          } catch {
              throw NSError(domain: "RnPollardKangarooModuleError", code: 3, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          }
      }
  }
}
