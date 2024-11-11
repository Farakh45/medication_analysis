import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css";
import ConditionAnalyzer from "./Analyze/ConditionAnalyzer";

const App = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [error, setError] = useState("");
  const [selectedChartType, setSelectedChartType] = useState("bar");
  const [subTabsData, setSubTabsData] = useState({});
  const [activeSubTab, setActiveSubTab] = useState("");
  const [selectedTab, setSelectedTab] = useState(null);
  const [medData, setMedData] = useState([]);

  // Fetch options for the select input
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/conditionData.json"); // Fetching directly from public folder
        const data = await response.json();

        // Check if the data format is correct
        if (Array.isArray(data)) {
          const uniqueConditions = Array.from(
            new Set(
              data
                .map((entry) => entry.code?.coding?.[0]?.display)
                .filter((display) => display !== undefined)
            )
          );

          // console.log(uniqueConditions)
          setOptions(uniqueConditions);
        } else {
          setError("Unexpected data format.");
        }
      } catch (err) {
        setError("Failed to fetch options.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabClick = async (tabId) => {
    setLoading(true);
    try {
      const selectedTab = tabs.find((tab) => tab.id === tabId);
      if (selectedTab) {
        setAnalysisData(selectedTab);
        setSubTabsData({
          ageGroups: selectedTab.ageGroups || {},
          genderDistribution: selectedTab.genderDistribution || {},
          countryDistribution: selectedTab.countryDistribution || [],
        });
        setSelectedTab(tabId);
        setActiveSubTab("");
        toast.success("Successfully loaded data", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (err) {
      console.error("Failed to fetch tab data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubTabClick = (subTab) => {
    setActiveSubTab(subTab);
  };

  const handleChartTypeChange = (chartType) => {
    setSelectedChartType(chartType);
  };

  const handleDataFetched = (demographicsData, medicationsData) => {
    setMedData(medicationsData);
    if(tabs.length > 0){
      setLoading(false)
     }
    
  };

  useEffect(() => {
    if (selectedOption) {
      setTabs(
        medData.map((med) => ({
          id: med.name,
          name: med.name,
          ageGroups: med.ageGroups,
          genderDistribution: med.genderDistribution,
          countryDistribution: med.countryDistribution,
        }))
      );
   
    } else {
      // Reset tabs when no condition is selected
      setTabs([]);
      setActiveSubTab("");
      setSubTabsData({});
      setSelectedTab(null);
      setLoading(true);
    }
  }, [selectedOption, medData]);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue)
    
    setActiveSubTab("");
    setSubTabsData({});
    setSelectedTab(null);
    setTabs([]);
    setLoading(true)
      
  
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Medication Data Analysis
      </h1>

      {/* Select Input for Condition */}
      <div className="mb-4">
        <label htmlFor="condition" className="block text-lg">
          Select Condition
        </label>
        <select
          id="condition"
          className="w-full p-2 border border-gray-300 rounded"
          onChange={handleSelectChange}
        >
          <option value="">--Select--</option>
          {loading ? (
            <option>Loading...</option>
          ) : error ? (
            <option>{error}</option>
          ) : (
            options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Dynamic Tabs */}
      {selectedOption && (
        <div className="mb-4">
          <h1 className="text-center text-3xl font-bold my-10">
            Medication(s) For {selectedOption}
          </h1>
          {loading ? (
            <p>Loading tabs...</p>
          ) : (
            <div className="flex space-x-4">
              {Array.isArray(tabs) &&
                tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Chart Type Selection - Styled Like Tabs */}
      {selectedTab && (
        <div className="mt-4 mb-4">
          <h2 className="text-center text-xl font-semibold">
            Select Chart Type
          </h2>
          <div className="flex space-x-4 justify-center">
            {["bar", "line", "pie"].map((chartType) => (
              <button
                key={chartType}
                className={`p-2 rounded ${
                  selectedChartType === chartType
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => handleChartTypeChange(chartType)}
              >
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tabs and Data Rendering */}
      {selectedTab && (
        <> <h1 className="text-center font-bol4">{selectedTab}</h1>
          <div className="mt-4 flex space-x-4 justify-center">
            <button
              onClick={() => handleSubTabClick("ageGroups")}
              className={`p-2 rounded ${
                activeSubTab === "ageGroups"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Age Groups
            </button>
            <button
              onClick={() => handleSubTabClick("genderDistribution")}
              className={`p-2 rounded ${
                activeSubTab === "genderDistribution"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Gender Distribution
            </button>
            <button
              onClick={() => handleSubTabClick("countryDistribution")}
              className={`p-2 rounded ${
                activeSubTab === "countryDistribution"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Country Distribution
            </button>
          </div>
        </>
      )}

      {/* Render the selected data */}
      {activeSubTab === "ageGroups" && subTabsData.ageGroups && (
        <div className="mt-4 bg-gray-100 py-4 rounded-lg h-[70vh]">
          <h2 className="text-xl font-semibold">Age Groups</h2>
          <ul className="flex justify-center items-center font-bold">
            {Object.entries(subTabsData.ageGroups).map(([ageRange, count]) => (
              <li className="px-4" key={ageRange}>
                {ageRange}: {count} people
              </li>
            ))}
          </ul>
          {selectedChartType === "bar" && (
            <BarChart
              data={Object.entries(subTabsData.ageGroups).map(
                ([ageRange, count]) => ({ label: ageRange, value: count })
              )}
            />
          )}
          {selectedChartType === "line" && (
            <LineChart
              data={Object.entries(subTabsData.ageGroups).map(
                ([ageRange, count]) => ({ label: ageRange, value: count })
              )}
            />
          )}
          {selectedChartType === "pie" && (
            <PieChart
              data={Object.entries(subTabsData.ageGroups).map(
                ([ageRange, count]) => ({ label: ageRange, value: count })
              )}
            />
          )}
        </div>
      )}

      {activeSubTab === "genderDistribution" &&
        subTabsData.genderDistribution && (
          <div className="mt-4 bg-gray-100  py-4 rounded-lg h-[70vh]">
            <h2 className="text-xl font-semibold">Gender Distribution</h2>
            <ul className="flex justify-center items-center font-bold">
              {Object.entries(subTabsData.genderDistribution).map(
                ([gender, count]) => (
                  <li className="px-4" key={gender}>
                    {gender}: {count} people
                  </li>
                )
              )}
            </ul>

            {/* Transform genderDistribution data to the required format */}
            {selectedChartType === "bar" && (
              <BarChart
                data={Object.entries(subTabsData.genderDistribution).map(
                  ([gender, count]) => ({ label: gender, value: count })
                )}
              />
            )}
            {selectedChartType === "line" && (
              <LineChart
                data={Object.entries(subTabsData.genderDistribution).map(
                  ([gender, count]) => ({ label: gender, value: count })
                )}
              />
            )}
            {selectedChartType === "pie" && (
              <PieChart
                data={Object.entries(subTabsData.genderDistribution).map(
                  ([gender, count]) => ({ label: gender, value: count })
                )}
              />
            )}
          </div>
        )}

      {activeSubTab === "countryDistribution" &&
        subTabsData.countryDistribution && (
          <div className="mt-4 bg-gray-100  py-4 rounded-lg h-[70vh]">
            <h2 className="text-xl font-semibold">Country Distribution</h2>
            <ul className="flex justify-center items-center font-bold">
              {subTabsData.countryDistribution.map(({ name, population }) => (
                <li className="px-4" key={name}>
                  {name}: {population} people
                </li>
              ))}
            </ul>

            {/* Transform countryDistribution data to the required format */}
            {selectedChartType === "bar" && (
              <BarChart
                data={subTabsData.countryDistribution.map(
                  ({ name, population }) => ({ label: name, value: population })
                )}
              />
            )}
            {selectedChartType === "line" && (
              <LineChart
                data={subTabsData.countryDistribution.map(
                  ({ name, population }) => ({ label: name, value: population })
                )}
              />
            )}
            {selectedChartType === "pie" && (
              <PieChart
                data={subTabsData.countryDistribution.map(
                  ({ name, population }) => ({ label: name, value: population })
                )}
              />
            )}
          </div>
        )}

      <ConditionAnalyzer
        conditionName={selectedOption}
        onDataFetched={handleDataFetched}
      />

      {/* Display Toast Messages */}
      <ToastContainer />
    </div>
  );
};

export default App;
