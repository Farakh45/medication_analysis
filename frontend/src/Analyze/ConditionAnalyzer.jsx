import React, { useEffect, useState } from "react";
import conditionData from "../data/ConditionData.json";
import patientData from "../data/PatientData.json";
import medicationRequestData from "../data/MedicationRequestData.json";

// Helper functions
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getCountry = (patient) => {
  if (
    patient.address &&
    patient.address.length > 0 &&
    patient.address[0].country
  ) {
    return patient.address[0].country;
  }
  return "Unknown";
};

// Main React component
const ConditionAnalyzer = ({ conditionName, onDataFetched }) => {
  const [demographics, setDemographics] = useState(null);
  const [medications, setMedications] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const [conditionRes, patientRes, medicationRes] = await Promise.all([
        //   fetch("/data/conditionData.json"),
        //   fetch("/data/patientData.json"),
        //   fetch("/data/medicationRequestData.json")
        // ]);

        // const [conditionData, patientData, medicationRequestData] = await Promise.all([
        //   conditionRes.json(),
        //   patientRes.json(),
        //   medicationRes.json()
        // ]);

        const patientConditionPairs = filterPatientsByCondition(
          conditionData,
          conditionName
        );

        if (patientConditionPairs.length === 0) {
          //   setError("No patients found with the specified condition");
          return;
        }

        const demographicsResult = analyzeDemographics(
          patientConditionPairs,
          patientData
        );
        const medicationsResult = analyzeMedications(
          patientConditionPairs,
          patientData,
          medicationRequestData
        );

        setDemographics(demographicsResult);
        setMedications(medicationsResult);

        // Call the parent callback to pass the data
        onDataFetched(demographicsResult, medicationsResult);
      } catch (err) {
        setError("Error fetching data");
      }
    };

    fetchData();
  }, [conditionName, onDataFetched]);

  const filterPatientsByCondition = (conditionData, conditionName) => {
    const matchedConditions = conditionData.filter(
      (entry) => entry.code?.coding?.[0]?.display === conditionName
    );

    const patientConditionPairs = matchedConditions
      .map((entry) => {
        const ref = entry.subject?.reference;
        if (ref && ref.startsWith("Patient/")) {
          const patientId = ref.split("/")[1];
          const conditionId = entry.id;
          return { patientId, conditionId };
        }
        return null;
      })
      .filter((pair) => pair !== null);

    return Array.from(
      new Map(
        patientConditionPairs.map((pair) => [
          `${pair.patientId}-${pair.conditionId}`,
          pair,
        ])
      ).values()
    );
  };

  const analyzeDemographics = (patientConditionPairs, patientData) => {
    const age = { distribution: {}, averageAge: null, medianAge: null };
    const gender = { male: 0, female: 0, non_binary: 0, prefer_not_to_say: 0 };
    const country = {};

    const ages = [];

    patientConditionPairs.forEach(({ patientId }) => {
      const patient = patientData.find((p) => p.id === patientId);
      if (!patient) return;

      const ageVal = calculateAge(patient.birthDate);
      if (ageVal !== null) {
        ages.push(ageVal);
        if (ageVal <= 18)
          age.distribution["0-18"] = (age.distribution["0-18"] || 0) + 1;
        else if (ageVal <= 35)
          age.distribution["19-35"] = (age.distribution["19-35"] || 0) + 1;
        else if (ageVal <= 50)
          age.distribution["36-50"] = (age.distribution["36-50"] || 0) + 1;
        else if (ageVal <= 65)
          age.distribution["51-65"] = (age.distribution["51-65"] || 0) + 1;
        else age.distribution["66+"] = (age.distribution["66+"] || 0) + 1;
      }

      const genderVal = patient.gender || "prefer_not_to_say";
      gender[genderVal] = (gender[genderVal] || 0) + 1;

      const countryVal = getCountry(patient);
      country[countryVal] = (country[countryVal] || 0) + 1;
    });

    const sortedAges = ages.sort((a, b) => a - b);
    age.averageAge = ages.length
      ? ages.reduce((sum, age) => sum + age, 0) / ages.length
      : 0;
    age.medianAge = sortedAges.length
      ? sortedAges[Math.floor(sortedAges.length / 2)]
      : 0;

    return { age, gender, country };
  };

  const analyzeMedications = (
    patientConditionPairs,
    patientData,
    medicationRequestData
  ) => {
    const medicationDistribution = {};

    medicationRequestData.forEach((med) => {
      if (!med.entry[0].resource.subject?.reference) {
        return;
      }

      const { subject, medicationCodeableConcept, reasonReference } =
        med.entry[0].resource;
      const patientId = subject.reference.split("/")[1];

      const matchedCondition = patientConditionPairs.find(
        (pair) =>
          pair.patientId === patientId &&
          reasonReference?.some(
            (ref) => ref.reference === `Condition/${pair.conditionId}`
          )
      );

      if (!matchedCondition) {
        return;
      }

      const { conditionId } = matchedCondition;
      const medName =
        medicationCodeableConcept?.coding?.[0]?.display || "Unknown";

      const patient = patientData.find((p) => p.id === patientId);
      if (!patient) return;

      const age = calculateAge(patient.birthDate);
      if (age === null) return;

      const gender = patient.gender || "prefer_not_to_say";
      const country = getCountry(patient);

      if (!medicationDistribution[medName]) {
        medicationDistribution[medName] = {
          ageGroups: {
            "0-18": 0,
            "19-35": 0,
            "36-50": 0,
            "51-65": 0,
            "66+": 0,
          },
          genderDistribution: {
            male: 0,
            female: 0,
            non_binary: 0,
            prefer_not_to_say: 0,
          },
          countryDistribution: {},
        };
      }

      if (age <= 18) medicationDistribution[medName].ageGroups["0-18"]++;
      else if (age <= 35) medicationDistribution[medName].ageGroups["19-35"]++;
      else if (age <= 50) medicationDistribution[medName].ageGroups["36-50"]++;
      else if (age <= 65) medicationDistribution[medName].ageGroups["51-65"]++;
      else medicationDistribution[medName].ageGroups["66+"]++;

      medicationDistribution[medName].genderDistribution[gender]++;
      medicationDistribution[medName].countryDistribution[country] =
        (medicationDistribution[medName].countryDistribution[country] || 0) + 1;
    });

    return Object.entries(medicationDistribution).map(([name, stats]) => ({
      name,
      ageGroups: stats.ageGroups,
      genderDistribution: stats.genderDistribution,
      countryDistribution: Object.entries(stats.countryDistribution).map(
        ([name, population]) => ({ name, population })
      ),
    }));
  };

  if (error) return <div>{error}</div>;

  return null; // Don't render anything in this component, just pass data to parent
};

export default ConditionAnalyzer;
