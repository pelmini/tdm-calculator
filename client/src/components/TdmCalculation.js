import React from "react";
import RulePanels from "./RulePanels";
import ResultList from "./ResultList";
import * as ruleService from "../services/rule.service";
import Engine from "../services/tdm-engine";

class TdmCalculationContainer extends React.Component {
  calculationId = 1;
  engine = null; //instance created on componentDidMount

  // These are the calculation results we want to calculate
  // and display on the main page.
  resultRuleCodes = [
    "PTS_DIFFERENCE",
    "PTS_EARNED",
    "TARGET_POINTS_PARK",
    "PARK_REQUIREMENT",
    "PARK_RESIDENTIAL",
    "PARK_COMMERCIAL",
    "PARK_INSTITUTIONAL",
    "PARK_SCHOOL_OTHER"
  ];

  state = {
    rules: [],
    formInputs: {},
    work: {}
  };

  componentDidMount() {
    ruleService.getByCalculationId(this.calculationId).then(response => {
      // console.log(response.data);
      //creates instance of Engine with all inputs and calculations 
      //from the CalculationRule table.
      //currently set to calculationId = 1, represents LA rule set.
      this.engine = new Engine(response.data); 
      this.engine.run(this.state.formInputs, this.resultRuleCodes);
      this.setState({
        rules: this.engine.showRulesArray()
      });
      

    });
  }

  onInputChange = e => {
    const ruleCode = e.target.name;
    let value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (!ruleCode) {
      throw new Error("Input is missing name attribute");
    }
    const rule = this.state.rules.filter(rule => rule.code === ruleCode);
    if (!rule) {
      throw new Error("Rule not found for code " + ruleCode);
    }

    // Convert value to appropriate Data type
    if (rule.dataType === "number") {
      value = value ? Number.parseFloat(value) : 0;
    }

    const formInputs = {
      ...this.state.formInputs,
      [e.target.name]: value
    };
    this.engine.run(formInputs, this.resultRuleCodes);
    const rules = this.engine.showRulesArray();
    // update state with modified formInputs and rules
    this.setState({ formInputs, rules }, ()=> {
      const work = this.engine.showWork(this.state.formInputs)
      this.setState({work}, () => {
        console.log('stateeeeeeee', this.state)
      })
    });
    
  };

  render() {
    const { rules } = this.state;
    const inputRules =
      rules && rules.filter(rule => rule.category === "input" && rule.used);
    const measureRules =
      rules && rules.filter(rule => rule.category === "measure" && rule.used);
    const resultRules =
      rules && rules.filter(rule => this.resultRuleCodes.includes(rule.code));
    return (
      <div style={{ margin: "1em" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#F8F8F8"
          }}
        >
          <div
            style={{
              width: "40%",
              margin: "0.5em"
            }}
          >
            <h3>Project Parameters</h3>
            {rules && rules.length > 0 ? (
              <RulePanels
                rules={inputRules}
                onInputChange={this.onInputChange}
              />
            ) : (
              <div>No Rules Loaded</div>
            )}
          </div>
          <div
            style={{
              width: "30%",
              margin: "0.5em"
            }}
          >
            <h3> Transportation Demand Measures</h3>
            {rules && rules.length > 0 ? (
              <RulePanels
                rules={measureRules}
                onInputChange={this.onInputChange}
              />
            ) : (
              <div>No Rules Loaded</div>
            )}
          </div>
          <div
            style={{
              width: "30%",
              margin: "0.5em"
            }}
          >
            <h3> Metrics</h3>
            {rules && rules.length > 0 ? (
              <ResultList rules={resultRules} />
            ) : (
              <div>No Rules Loaded</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default TdmCalculationContainer;
