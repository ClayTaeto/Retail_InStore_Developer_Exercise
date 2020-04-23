"use strict";
import "./style/index.scss";
import "whatwg-fetch";
import { expect } from "chai";

function component() {
	const tabContainer = document.getElementById("tab-container")
	const cursorElement = document.getElementById("tab-cursor")

	//get nav data and fire off setup
	fetch("./navigation.json")
		.then((response) => {
			return response.json() //parse into json
		})
		//assert data and normalize
		.then(formatCityData)
		//build the tab elements
		.then(setupTabs)
		.catch(function(ex) {
			console.log("parsing failed", ex)
		})

	function formatCityData(data) {
		expect(data).to.have.property("cities")
		expect(data.cities).to.have.length
		expect(data.cities[0]).to.have.property("label")

		return data.cities.map((city) => {
			return {
				name: city.label,
				timezone: 0
			}
		})
	}

	function setupTabs(tabs) {
		expect(tabs).to.have.length
		expect(tabs[0]).to.have.property("name")

		tabs.map((city) => {
			//create the divs for the tab and label
			let newTab = document.createElement("div");
			let citylabel = document.createElement("div");

			//Aria roles for screen readers
			//lets it know it"s a control for tab content. 
			newTab.setAttribute("role", "tab");

			//will let it know it"s not currently selected
			newTab.setAttribute("aria-selected", "false");

			//give label it"s name
			citylabel.innerText = city.name;

			//add label to tab
			newTab.appendChild(citylabel);

			newTab.tabIndex = 0; //let this div be focused on keyboard

			newTab.addEventListener("click", (e) => {
				setCursorToTab(e.currentTarget); //adjust the cursor to the label"s position and width. 
			}, false);

			newTab.addEventListener("keyup", function(e) {
				// Number 13 is the "Enter" key on the keyboard, 32 is "Space"           
				if (event.keyCode === 13 || event.keyCode === 32) {
					// Shouldn"t come up, but cancel the default action            
					event.preventDefault();
					newTab.click(); // Trigger the button element with a click
				}
			});

			//once setup is all done, add it to the page.
			tabContainer.appendChild(newTab)
		})

		function setCursorToTab(elem, ignoreSelection) {

			expect(elem).to.have.property("tagName").equal("DIV");
			expect(elem.firstElementChild).to.have.property("tagName").equal("DIV");

			//the full tab has a clickable area, but the label has the actionable information
			cursorElement.style.left = elem.firstElementChild.offsetLeft + "px";
			cursorElement.style.width = elem.firstElementChild.clientWidth + "px";

			//if the ignoreSelection flag is set,
			//then the roles and classes for selection will not be updated
			//used for resize events. 
			if (ignoreSelection) {
				return;
			}


			for (let node of tabContainer.children) {
				//go through all other tabs and remove the active class and selected role
				node.firstElementChild.classList.remove("active")
				node.setAttribute("aria-selected", "false");
			}

			//make this tab the active tab
			elem.setAttribute("aria-selected", "true");
			elem.firstElementChild.classList.add("active");
		}

		window.onresize = function() {
			var activeTab = tabContainer.getElementsByClassName("active")
			expect(activeTab).to.have.length;
			expect(activeTab[0]).to.have.property("tagName").equal("DIV");

			//checking the parent this time since we found the tab through the label. 
			expect(activeTab[0].parentElement).to.have.property("tagName").equal("DIV");
			//update the cursor according to this tab. 
			setCursorToTab(activeTab[0].parentElement, true)
		}

		//I noticed in the video that the focus highlight was hidden
		//after a user clicks. I went and reproduced that behavior
		tabContainer.onclick = function() {
			tabContainer.classList.add("hidefocus");
		}

		//This re-enables the focus highlight if some one uses the
		//keyboard while focused on the tab element
		tabContainer.addEventListener("keyup", function(e) {
			tabContainer.classList.remove("hidefocus");
		})

		//initialize cursor location
		setCursorToTab(tabContainer.firstElementChild)
	}
}

component()