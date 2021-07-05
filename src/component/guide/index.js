import React from "react";

const InlineLink = ({addr,name})=>(<a href={`/${addr}`} target="_blank" className="text-blue-700">{name}</a>)

const Welcome = () => {
  return (
    <div>
      <div className="text-3xl text-gray-500 font-bold my-4">Introduction</div>
      <div className="mb-4">
        <div className="text-4xl inline">W</div>
        <div className="inline text-lg">
          elcome to the data science learning platform (DSLP). DSLP contains a
          set of in-house data sets that are ready to use for teaching and
          learning purposes. The data sets are diverse in terms of the
          application domains to cater for students with different interests and
          backgrounds. Students can apply various data science techniques, using
          different strategies on them. Those data sets can be selected from
          some representative domains such as weather, finance, astronomical,
          healthcare, demographic, and traffic. DSLP also allows users to upload
          and analyze their own data sets in common data file formats, currently we only accept Comma-separated values (CSV). For security purpose, users can access to all the
          in-house data sets and only the ones they upload to the system by
          default. They can also choose to make their data set accessible to
          others for collaboration.
        </div>
      </div>
    </div>
  );
};

const Preparation = ({history}) => {
  return (
    <div>
      <div className="text-3xl text-gray-500 font-bold my-4">Preparation</div>
      <div className="mb-4">
        <div className="text-4xl inline">F</div>
        <div className="inline text-lg">
        irst of all, we need to select a dataset we are gonna use. In the <InlineLink addr="home" name="Data"/> module, you can either upload your own data or use the recommended dataset. Before we do any scientific research on our dataset, it is important to clean our dataset. Flaws in the dataset like missing data could prevent us from getting the correct results. You can do data cleaning in the <InlineLink addr="clean" name="Clean"/> module.
        </div>

        <div className="my-4 flex justify-around">
          <div onClick={()=>{
            history.push({
              pathname:'/',
              state:{
                guide:true
              }
            })
          }} className="cursor-pointer rounded-full py-4 px-12 bg-gray-200 border-2 hover:bg-gray-300 border-gray-400 text-2xl text-gray-700">Upload data</div>
          <div onClick={()=>{
            history.push({
              pathname:'/clean',
              state:{
                guide:true
              }
            })
          }}className="cursor-pointer rounded-full py-4 px-12 bg-gray-200 border-2 hover:bg-gray-300 border-gray-400 text-2xl text-gray-700">Clean data</div>
        </div>
      </div>
    </div>
  );
};

const SingleVariableAnalysis = ({history})=>{
  return (
    <div>
      <div className="text-3xl text-gray-500 font-bold my-4">Single Variable Analysis</div>
      <div className="mb-4">
        <div className="text-4xl inline">T</div>
        <div className="inline text-lg">
          o predict the house price is our final goal. But first things first, we should have a basic understanding of house price value itself. We can get an overview of the value of this variable by the <InlineLink addr="summary" name="Summary"/> module. The first panel shows a description of the house price value, including count, mean, max and other summarized properties.
        </div>

        <div className="my-4 flex justify-around">
          <div onClick={()=>{
            history.push({
              pathname:'/summary',
              state:{
                guide:true
              }
            })
          }} className="cursor-pointer rounded-full py-4 px-12 bg-gray-200 border-2 hover:bg-gray-300 border-gray-400 text-2xl text-gray-700">Analyze Single Variable</div>
        </div>
      </div>
    </div>
  );
}

const MultipleVariableAnalysis = ({history})=>{
  return (
    <div>
      <div className="text-3xl text-gray-500 font-bold my-4">Multiple Variables Analysis</div>
      <div className="mb-4">
        <div className="text-4xl inline">I</div>
        <div className="inline text-lg">
          t's not a easy task to find relationship between variables only by looking at their values. But it will be straight forward to find such relationships by <InlineLink addr="visualization" name="Visualization"/>. We can find relationships between both numerical values and categorical features.
        </div>

        <div className="my-4 flex justify-around">
          <div onClick={()=>{
            history.push({
              pathname:'/visualization',
              state:{
                guide:true
              }
            })
          }} className="cursor-pointer rounded-full py-4 px-12 bg-gray-200 border-2 hover:bg-gray-300 border-gray-400 text-2xl text-gray-700">Analyze Multiple Variables</div>
        </div>
      </div>
    </div>
  );
}

const Page = ({history}) => {
  return (
    <div className="flex flex-col justify-start items-start p-8">
      <Welcome />
      <Preparation history={history}/>
      <SingleVariableAnalysis history={history}/>
      <MultipleVariableAnalysis history={history}/>
    </div>
  );
};

export default Page;
