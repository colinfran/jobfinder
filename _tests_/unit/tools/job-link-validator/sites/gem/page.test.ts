/** @jest-environment node */
import {
  extractGemLocationFromHtml,
  hasGemError,
} from "../../../../../../tools/job-link-validator/sites/gem/page"

describe("tools/job-link-validator/sites/gem/page", () => {
  it("detects not-found Gem page copy", () => {
    const html = `
      <div>
        <h1>Job not found</h1>
        <p>The link you followed may be out of date or this job post may have been removed.</p>
      </div>
    `

    expect(hasGemError(html)).toBe(true)
  })

  it("extracts in-office location and workplace type", () => {
    const html = `
      <div class="attributesContainer-26">
        <div class="iconLabel-27"><span>San Francisco • New York</span></div>
        <div class="iconLabel-27">Engineering</div>
        <div class="labelText-28">In office</div>
        <div class="labelText-29">Full-time</div>
      </div>
    `

    expect(extractGemLocationFromHtml(html)).toEqual({
      location: "San Francisco • New York",
      workplaceType: "In office",
    })
  })

  it("extracts hybrid location and workplace type", () => {
    const html = `
      <div class="attributesContainer-35">
        <div class="iconLabel-36"><span>Athens, Greece</span></div>
        <div class="iconLabel-36">Software</div>
        <div class="labelText-37">Hybrid</div>
        <div class="labelText-38">Full-time</div>
      </div>
    `

    expect(extractGemLocationFromHtml(html)).toEqual({
      location: "Athens, Greece",
      workplaceType: "Hybrid",
    })
  })

  it("extracts remote location and workplace type", () => {
    const html = `
      <div class="attributesContainer-35">
        <div class="iconLabel-36"><span>Remote</span></div>
        <div class="iconLabel-36">R&amp;D</div>
        <div class="labelText-37">Remote</div>
        <div class="labelText-38">Full-time</div>
      </div>
    `

    expect(extractGemLocationFromHtml(html)).toEqual({
      location: "Remote",
      workplaceType: "Remote",
    })
  })
})
