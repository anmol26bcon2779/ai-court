import { runSelfDiagnosticTests } from './court.test';

async function main() {
  console.log('⚖️ Running AI Court Full System Diagnostics & Integration Tests...\n');
  const { passed, failed, results } = await runSelfDiagnosticTests();

  results.forEach(r => {
    if (r.success) {
      console.log(`  ✓ [PASS] ${r.name}`);
    } else {
      console.log(`  ✗ [FAIL] ${r.name} - ${r.details}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${results.length} tests.`);
  const proc = (globalThis as any).process;
  if (failed > 0) {
    if (proc) proc.exit(1);
  } else {
    console.log('🎉 All courtroom system tests PASSED successfully!\n');
    if (proc) proc.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal diagnostic test error:', err);
  const proc = (globalThis as any).process;
  if (proc) proc.exit(1);
});
