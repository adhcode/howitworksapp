"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _classvalidator = require("class-validator");
const _customvalidators = require("./custom-validators");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TestDto = class TestDto {
};
_ts_decorate([
    (0, _customvalidators.IsFutureDate)(),
    _ts_metadata("design:type", String)
], TestDto.prototype, "futureDate", void 0);
_ts_decorate([
    (0, _customvalidators.IsAfterOriginalExpiry)(),
    _ts_metadata("design:type", String)
], TestDto.prototype, "expiryDate", void 0);
_ts_decorate([
    (0, _customvalidators.IsReasonableRentAmount)(),
    _ts_metadata("design:type", Number)
], TestDto.prototype, "rentAmount", void 0);
_ts_decorate([
    (0, _customvalidators.IsValidContractDuration)(),
    _ts_metadata("design:type", String)
], TestDto.prototype, "contractExpiryDate", void 0);
_ts_decorate([
    (0, _customvalidators.IsValidOriginalExpiry)(),
    _ts_metadata("design:type", String)
], TestDto.prototype, "originalExpiry", void 0);
describe('Custom Validators', ()=>{
    describe('IsFutureDate', ()=>{
        it('should pass for future dates', async ()=>{
            const dto = new TestDto();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            dto.futureDate = futureDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const futureDateErrors = errors.filter((e)=>e.property === 'futureDate');
            expect(futureDateErrors).toHaveLength(0);
        });
        it('should fail for past dates', async ()=>{
            const dto = new TestDto();
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            dto.futureDate = pastDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const futureDateErrors = errors.filter((e)=>e.property === 'futureDate');
            expect(futureDateErrors.length).toBeGreaterThan(0);
        });
        it('should fail for today', async ()=>{
            const dto = new TestDto();
            dto.futureDate = new Date().toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const futureDateErrors = errors.filter((e)=>e.property === 'futureDate');
            expect(futureDateErrors.length).toBeGreaterThan(0);
        });
    });
    describe('IsAfterOriginalExpiry', ()=>{
        it('should pass when expiry is after original expiry', async ()=>{
            const dto = new TestDto();
            dto.originalExpiryDate = '2024-06-01T00:00:00.000Z';
            dto.expiryDate = '2024-12-01T00:00:00.000Z';
            const errors = await (0, _classvalidator.validate)(dto);
            const expiryErrors = errors.filter((e)=>e.property === 'expiryDate');
            expect(expiryErrors).toHaveLength(0);
        });
        it('should fail when expiry is before original expiry', async ()=>{
            const dto = new TestDto();
            dto.originalExpiryDate = '2024-12-01T00:00:00.000Z';
            dto.expiryDate = '2024-06-01T00:00:00.000Z';
            const errors = await (0, _classvalidator.validate)(dto);
            const expiryErrors = errors.filter((e)=>e.property === 'expiryDate');
            expect(expiryErrors.length).toBeGreaterThan(0);
        });
        it('should pass when original expiry is not provided', async ()=>{
            const dto = new TestDto();
            dto.expiryDate = '2024-12-01T00:00:00.000Z';
            const errors = await (0, _classvalidator.validate)(dto);
            const expiryErrors = errors.filter((e)=>e.property === 'expiryDate');
            expect(expiryErrors).toHaveLength(0);
        });
    });
    describe('IsReasonableRentAmount', ()=>{
        it('should pass for reasonable amounts', async ()=>{
            const dto = new TestDto();
            dto.rentAmount = 25000;
            const errors = await (0, _classvalidator.validate)(dto);
            const rentErrors = errors.filter((e)=>e.property === 'rentAmount');
            expect(rentErrors).toHaveLength(0);
        });
        it('should fail for amounts below minimum', async ()=>{
            const dto = new TestDto();
            dto.rentAmount = 500;
            const errors = await (0, _classvalidator.validate)(dto);
            const rentErrors = errors.filter((e)=>e.property === 'rentAmount');
            expect(rentErrors.length).toBeGreaterThan(0);
        });
        it('should fail for amounts above maximum', async ()=>{
            const dto = new TestDto();
            dto.rentAmount = 15000000;
            const errors = await (0, _classvalidator.validate)(dto);
            const rentErrors = errors.filter((e)=>e.property === 'rentAmount');
            expect(rentErrors.length).toBeGreaterThan(0);
        });
        it('should fail for non-numeric values', async ()=>{
            const dto = new TestDto();
            dto.rentAmount = 'not-a-number';
            const errors = await (0, _classvalidator.validate)(dto);
            const rentErrors = errors.filter((e)=>e.property === 'rentAmount');
            expect(rentErrors.length).toBeGreaterThan(0);
        });
    });
    describe('IsValidContractDuration', ()=>{
        it('should pass for valid contract duration', async ()=>{
            const dto = new TestDto();
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 12); // 1 year from now
            dto.contractExpiryDate = futureDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const durationErrors = errors.filter((e)=>e.property === 'contractExpiryDate');
            expect(durationErrors).toHaveLength(0);
        });
        it('should fail for too short contract duration', async ()=>{
            const dto = new TestDto();
            const shortDate = new Date();
            shortDate.setMonth(shortDate.getMonth() + 2); // 2 months from now
            dto.contractExpiryDate = shortDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const durationErrors = errors.filter((e)=>e.property === 'contractExpiryDate');
            expect(durationErrors.length).toBeGreaterThan(0);
        });
        it('should fail for too long contract duration', async ()=>{
            const dto = new TestDto();
            const longDate = new Date();
            longDate.setFullYear(longDate.getFullYear() + 6); // 6 years from now
            dto.contractExpiryDate = longDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const durationErrors = errors.filter((e)=>e.property === 'contractExpiryDate');
            expect(durationErrors.length).toBeGreaterThan(0);
        });
    });
    describe('IsValidOriginalExpiry', ()=>{
        it('should pass for existing tenant with valid original expiry', async ()=>{
            const dto = new TestDto();
            dto.isExistingTenant = true;
            const validDate = new Date();
            validDate.setMonth(validDate.getMonth() + 3); // 3 months from now
            dto.originalExpiry = validDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const originalErrors = errors.filter((e)=>e.property === 'originalExpiry');
            expect(originalErrors).toHaveLength(0);
        });
        it('should pass for new tenant without original expiry', async ()=>{
            const dto = new TestDto();
            dto.isExistingTenant = false;
            const errors = await (0, _classvalidator.validate)(dto);
            const originalErrors = errors.filter((e)=>e.property === 'originalExpiry');
            expect(originalErrors).toHaveLength(0);
        });
        it('should fail for existing tenant without original expiry', async ()=>{
            const dto = new TestDto();
            dto.isExistingTenant = true;
            const errors = await (0, _classvalidator.validate)(dto);
            const originalErrors = errors.filter((e)=>e.property === 'originalExpiry');
            expect(originalErrors.length).toBeGreaterThan(0);
        });
        it('should fail for original expiry too far in future', async ()=>{
            const dto = new TestDto();
            dto.isExistingTenant = true;
            const farFutureDate = new Date();
            farFutureDate.setMonth(farFutureDate.getMonth() + 12); // 12 months from now
            dto.originalExpiry = farFutureDate.toISOString();
            const errors = await (0, _classvalidator.validate)(dto);
            const originalErrors = errors.filter((e)=>e.property === 'originalExpiry');
            expect(originalErrors.length).toBeGreaterThan(0);
        });
    });
});

//# sourceMappingURL=custom-validators.spec.js.map